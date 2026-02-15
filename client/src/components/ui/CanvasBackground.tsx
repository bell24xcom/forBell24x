'use client';

import React, { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: number[];
  opacity: number;
}

interface CanvasBackgroundProps {
  className?: string;
  nodeCount?: number;
  connectionDistance?: number;
  animationSpeed?: number;
}

export default function CanvasBackground({
  className = '',
  nodeCount = 50,
  connectionDistance = 150,
  animationSpeed = 0.5,
}: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const initNodes = () => {
      nodesRef.current = [];
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * animationSpeed,
          vy: (Math.random() - 0.5) * animationSpeed,
          size: Math.random() * 3 + 1,
          connections: [],
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
    };

    initNodes();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Clear canvas with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)'); // Dark navy
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.90)'); // Medium blue
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)'); // Dark navy

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Update and draw nodes
      nodesRef.current.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.offsetWidth) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.offsetHeight) node.vy *= -1;

        // Mouse interaction
        const dist = Math.hypot(mousePos.current.x - node.x, mousePos.current.y - node.y);
        if (dist < 100) {
          node.size = Math.min(node.size * 1.1, 8);
          node.opacity = Math.min(node.opacity * 1.2, 1);
        } else {
          node.size = Math.max(node.size * 0.98, 1);
          node.opacity = Math.max(node.opacity * 0.99, 0.3);
        }

        // Find connections
        node.connections = [];
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
            if (distance < connectionDistance) {
              node.connections.push(j);
            }
          }
        });

        // Draw connections first (so they appear behind nodes)
        node.connections.forEach(connectionIndex => {
          const connectedNode = nodesRef.current[connectionIndex];
          const distance = Math.hypot(node.x - connectedNode.x, node.y - connectedNode.y);
          const opacity = (1 - distance / connectionDistance) * 0.5;

          // Create gradient line for data flow effect
          const lineGradient = ctx.createLinearGradient(
            node.x,
            node.y,
            connectedNode.x,
            connectedNode.y
          );
          lineGradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`); // Blue
          lineGradient.addColorStop(0.5, `rgba(147, 51, 234, ${opacity * 0.8})`); // Purple
          lineGradient.addColorStop(1, `rgba(245, 158, 11, ${opacity * 0.6})`); // Amber

          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.stroke();

          // Add flowing particles on connections
          const time = Date.now() * 0.001;
          const progress = (Math.sin(time + i * 0.1) + 1) / 2;
          const particleX = node.x + (connectedNode.x - node.x) * progress;
          const particleY = node.y + (connectedNode.y - node.y) * progress;

          ctx.fillStyle = `rgba(245, 158, 11, ${opacity * 2})`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Draw nodes on top
      nodesRef.current.forEach(node => {
        // Node glow effect
        const glowGradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.size * 3
        );
        glowGradient.addColorStop(0, `rgba(59, 130, 246, ${node.opacity})`);
        glowGradient.addColorStop(0.5, `rgba(147, 51, 234, ${node.opacity * 0.5})`);
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        const coreGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${node.opacity})`);
        coreGradient.addColorStop(0.7, `rgba(59, 130, 246, ${node.opacity * 0.8})`);
        coreGradient.addColorStop(1, `rgba(147, 51, 234, ${node.opacity * 0.3})`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add subtle data visualization overlay
      drawDataOverlay(ctx, canvas.offsetWidth, canvas.offsetHeight);
    };

    // Data visualization overlay
    const drawDataOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = Date.now() * 0.0005;

      // Trading volume waves
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x += 20) {
        const y =
          height * 0.7 + Math.sin(x * 0.01 + time) * 30 + Math.sin(x * 0.02 + time * 2) * 15;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Global trade indicators
      const indicators = [
        { x: width * 0.2, y: height * 0.3, label: 'Mumbai', activity: Math.sin(time * 3) },
        { x: width * 0.8, y: height * 0.4, label: 'Delhi', activity: Math.cos(time * 2.5) },
        { x: width * 0.5, y: height * 0.6, label: 'Bangalore', activity: Math.sin(time * 4) },
        { x: width * 0.7, y: height * 0.2, label: 'Chennai', activity: Math.cos(time * 3.5) },
      ];

      indicators.forEach(indicator => {
        const activity = (indicator.activity + 1) / 2; // Normalize to 0-1
        const pulseSize = 5 + activity * 15;

        // Pulsing circle
        ctx.fillStyle = `rgba(34, 197, 94, ${0.2 + activity * 0.3})`;
        ctx.beginPath();
        ctx.arc(indicator.x, indicator.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // City label
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + activity * 0.4})`;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(indicator.label, indicator.x, indicator.y - pulseSize - 5);
      });
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [nodeCount, connectionDistance, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    />
  );
}
