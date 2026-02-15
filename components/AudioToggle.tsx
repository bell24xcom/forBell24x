'use client';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
export default function AudioToggle(){
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { const v = typeof window !== 'undefined' ? localStorage.getItem('bell24h:audio') : null; setEnabled(v === 'on'); }, []);
  useEffect(() => { if (typeof window === 'undefined') return; localStorage.setItem('bell24h:audio', enabled ? 'on' : 'off'); }, [enabled]);
  const ensureAudio = () => { if (audioRef.current) return; try { const el = new Audio('/audio/bell-chime.mp3'); el.preload = 'none'; audioRef.current = el; } catch {} };
  return (
    <button aria-label={enabled?'Disable sound':'Enable sound'} onPointerDown={ensureAudio} onClick={()=>setEnabled(v=>!v)} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm hover:bg-white/5">
      {enabled ? <Volume2 size={18}/> : <VolumeX size={18}/>} <span className="hidden sm:inline">{enabled?'Sound On':'Sound Off'}</span>
    </button>
  );
}
