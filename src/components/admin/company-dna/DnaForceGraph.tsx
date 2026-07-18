'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DnaGraphData, DnaGraphEdge, DnaGraphNode } from '@/src/lib/company-dna/types';

interface SimNode extends DnaGraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fx?: number | null;
  fy?: number | null;
}

interface Props {
  data: DnaGraphData;
  mode: '2d' | '3d';
  onSelect?: (node: DnaGraphNode | null) => void;
  selectedId?: string | null;
}

const WIDTH = 900;
const HEIGHT = 520;

export default function DnaForceGraph({ data, mode, onSelect, selectedId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<DnaGraphEdge[]>([]);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const animRef = useRef<number>(0);
  const [, tick] = useState(0);

  const initSim = useCallback(() => {
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    simRef.current = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const r = n.type === 'company' ? 0 : n.type === 'layer' ? 120 : 180 + (i % 5) * 15;
      const layerZ = (n.layer ?? 0) * 18;
      return {
        ...n,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        z: layerZ,
        vx: 0,
        vy: 0,
        vz: 0,
      };
    });
    edgesRef.current = data.edges;
  }, [data]);

  useEffect(() => {
    initSim();
  }, [initSim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodeMap = () => new Map(simRef.current.map(n => [n.id, n]));

    const step = () => {
      const nodes = simRef.current;
      const edges = edgesRef.current;
      const map = nodeMap();
      const cx = WIDTH / 2;
      const cy = HEIGHT / 2;

      for (const n of nodes) {
        if (n.fx != null && n.fy != null) {
          n.x = n.fx;
          n.y = n.fy;
          continue;
        }
        n.vx += (cx - n.x) * (n.type === 'company' ? 0.02 : 0.001);
        n.vy += (cy - n.y) * (n.type === 'company' ? 0.02 : 0.001);
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = a.type === 'company' || b.type === 'company' ? 80 : 40;
          if (dist < minDist) {
            const f = (minDist - dist) / dist * 0.5;
            a.vx -= dx * f;
            a.vy -= dy * f;
            b.vx += dx * f;
            b.vy += dy * f;
          }
        }
      }

      for (const e of edges) {
        const a = map.get(e.source);
        const b = map.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = e.type === 'layer_link' ? 140 : 70;
        const f = (dist - target) / dist * 0.04;
        a.vx += dx * f;
        a.vy += dy * f;
        b.vx -= dx * f;
        b.vy -= dy * f;
      }

      if (nodes[0]) {
        nodes[0].x = cx;
        nodes[0].y = cy;
        nodes[0].vx = 0;
        nodes[0].vy = 0;
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const sorted = [...nodes].sort((a, b) => (mode === '3d' ? a.z - b.z : 0));

      for (const e of edges) {
        const a = map.get(e.source);
        const b = map.get(e.target);
        if (!a || !b) continue;
        const scaleA = mode === '3d' ? 1 + a.z / 400 : 1;
        const scaleB = mode === '3d' ? 1 + b.z / 400 : 1;
        const ax = cx + (a.x - cx) * scaleA;
        const ay = cy + (a.y - cy) * scaleA;
        const bx = cx + (b.x - cx) * scaleB;
        const by = cy + (b.y - cy) * scaleB;
        ctx.strokeStyle = e.type === 'risk' ? 'rgba(239,68,68,0.5)' : e.type === 'memory' ? 'rgba(6,182,212,0.45)' : 'rgba(100,116,139,0.35)';
        ctx.lineWidth = e.type === 'layer_link' ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      for (const n of sorted) {
        const scale = mode === '3d' ? 1 + n.z / 400 : 1;
        const px = cx + (n.x - cx) * scale;
        const py = cy + (n.y - cy) * scale;
        const r = n.size * (mode === '3d' ? scale * 0.9 : 1);
        const isSelected = n.id === selectedId;

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.type === 'entity' ? 0.85 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (n.type === 'company' || n.type === 'layer' || isSelected) {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = `${n.type === 'company' ? 11 : 9}px system-ui`;
          ctx.textAlign = 'center';
          const label = n.label.length > 22 ? n.label.slice(0, 20) + '…' : n.label;
          ctx.fillText(label, px, py + r + 12);
        }
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [data, mode, selectedId]);

  const hitTest = (clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;

    for (const n of [...simRef.current].reverse()) {
      const scale = mode === '3d' ? 1 + n.z / 400 : 1;
      const px = cx + (n.x - cx) * scale;
      const py = cy + (n.y - cy) * scale;
      const r = n.size * scale + 4;
      if ((x - px) ** 2 + (y - py) ** 2 < r * r) return n;
    }
    return null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="w-full rounded-xl border border-slate-700 cursor-grab active:cursor-grabbing"
      style={{ maxHeight: HEIGHT }}
      onMouseDown={e => {
        const n = hitTest(e.clientX, e.clientY);
        if (n) {
          dragRef.current = { id: n.id, offsetX: 0, offsetY: 0 };
          n.fx = n.x;
          n.fy = n.y;
          onSelect?.(n);
        } else {
          onSelect?.(null);
        }
      }}
      onMouseMove={e => {
        if (!dragRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
        const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
        const n = simRef.current.find(nn => nn.id === dragRef.current!.id);
        if (n) {
          n.fx = x;
          n.fy = y;
          tick(t => t + 1);
        }
      }}
      onMouseUp={() => {
        if (dragRef.current) {
          const n = simRef.current.find(nn => nn.id === dragRef.current!.id);
          if (n) {
            n.fx = null;
            n.fy = null;
          }
        }
        dragRef.current = null;
      }}
      onMouseLeave={() => {
        dragRef.current = null;
      }}
    />
  );
}
