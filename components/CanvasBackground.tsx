'use client';
import { useEffect, useRef } from 'react';
export default function CanvasBackground(){
  const ref = useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{ if (typeof window==='undefined') return; if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = () => {
      const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if(!ctx) return;
      const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; }; resize(); window.addEventListener('resize', resize);
      let t = 0, raf = 0;
      const loop = () => { t+=0.003; ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,c.width,c.height); ctx.globalAlpha=0.15;
        for(let i=0;i<60;i++){ const x=(Math.sin(t*i)*0.5+0.5)*c.width; const y=(Math.cos(t*(i+3))*0.5+0.5)*c.height; ctx.beginPath(); ctx.arc(x,y,1.2,0,Math.PI*2); ctx.fillStyle='#ffd166'; ctx.fill(); }
        ctx.globalAlpha=1; raf=requestAnimationFrame(loop);
      }; raf=requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    };
    const id = 'requestIdleCallback' in window ? (window as any).requestIdleCallback(start) : setTimeout(start,0);
    return () => { if (typeof id==='number') clearTimeout(id); };
  },[]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10"/>;
}
