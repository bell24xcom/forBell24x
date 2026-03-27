'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ThreeDBellProps {
  size?: number;
  enableSound?: boolean;
  className?: string;
}

export default function ThreeDBell({
  size = 80,
  enableSound = false,
  className = '',
}: ThreeDBellProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const bellRef = useRef<THREE.Group>();
  const animationRef = useRef<number>();
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);

  // Temple bell sound (using Web Audio API)
  const playBellSound = () => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Create temple bell-like sound with multiple frequencies
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Base frequency
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 1.5);

    // Add reverb-like effect
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffa500, 0.5, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Create bell geometry
    const bellGroup = new THREE.Group();

    // Bell body (using a custom shape)
    const bellGeometry = new THREE.ConeGeometry(1.2, 2, 8);
    const bellMaterial = new THREE.MeshPhongMaterial({
      color: 0xd4af37, // Golden color
      shininess: 100,
      specular: 0xffffff,
    });
    const bell = new THREE.Mesh(bellGeometry, bellMaterial);
    bell.position.y = -0.5;
    bell.castShadow = true;
    bell.receiveShadow = true;
    bellGroup.add(bell);

    // Bell top/crown
    const crownGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({
      color: 0xb8860b,
      shininess: 100,
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.75;
    crown.castShadow = true;
    bellGroup.add(crown);

    // Bell clapper
    const clapperGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const clapperMaterial = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
    const clapper = new THREE.Mesh(clapperGeometry, clapperMaterial);
    clapper.position.y = -1.2;
    bellGroup.add(clapper);

    // Hanging chain/rope
    const ropeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
    const ropeMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
    rope.position.y = 1.5;
    bellGroup.add(rope);

    scene.add(bellGroup);
    camera.position.z = 5;

    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    bellRef.current = bellGroup;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (bellRef.current) {
        // Gentle rotation
        bellRef.current.rotation.y += 0.005;

        // Sway animation when hovered
        if (isHovered) {
          const time = Date.now() * 0.005;
          bellRef.current.rotation.z = Math.sin(time) * 0.1;
          bellRef.current.position.x = Math.sin(time * 1.5) * 0.05;

          // Add golden glow effect
          pointLight.intensity = 0.8 + Math.sin(time * 2) * 0.3;
        } else {
          // Return to center smoothly
          bellRef.current.rotation.z *= 0.95;
          bellRef.current.position.x *= 0.95;
          pointLight.intensity = 0.5;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, isHovered]);

  const handleClick = () => {
    if (bellRef.current) {
      // Trigger bell swing animation
      const swingIntensity = 0.3;
      const currentTime = Date.now() * 0.01;

      // Create a more dramatic swing
      bellRef.current.rotation.z = swingIntensity;

      // Play sound
      playBellSound();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mountRef}
        className='cursor-pointer transition-transform hover:scale-110'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ width: size, height: size }}
      />

      {/* Sound toggle button */}
      <button
        onClick={e => {
          e.stopPropagation();
          setSoundEnabled(!soundEnabled);
        }}
        className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full text-xs font-bold transition ${
          soundEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}
        title={soundEnabled ? 'Sound On' : 'Sound Off'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Hover tooltip */}
      {isHovered && (
        <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
          Click to ring the bell!
        </div>
      )}
    </div>
  );
}
