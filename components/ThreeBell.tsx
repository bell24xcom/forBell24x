'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
const BellInner = dynamic(()=>import('./ThreeBellInner'),{ ssr:false, loading:()=>null });
export default function ThreeBell(){
  const [on,setOn]=useState(false);
  return <div onMouseEnter={()=>setOn(true)} className="size-10 md:size-12 rounded-full bg-gradient-to-br from-amber-300/40 to-yellow-500/40 backdrop-blur flex items-center justify-center" aria-hidden>{on?<BellInner/>:null}</div>;
}
