'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin, ListFilter } from 'lucide-react';
export default function SearchBar(){
  const router=useRouter(); const [q,setQ]=useState(''); const [cat,setCat]=useState(''); const [loc,setLoc]=useState('');
  const onSubmit=(e:React.FormEvent)=>{ e.preventDefault(); const p=new URLSearchParams(); if(q)p.set('q',q); if(cat)p.set('category',cat); if(loc)p.set('location',loc); router.push(`/search?${p.toString()}`); };
  return (
    <form onSubmit={onSubmit} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_220px_auto]">
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-3">
        <Search size={18} className="text-neutral-300"/><input aria-label="Search products or suppliers" value={q} onChange={e=>setQ(e.target.value)} placeholder="What are you looking for? e.g., steel pipes" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"/>
      </label>
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-3">
        <ListFilter size={18} className="text-neutral-300"/><input aria-label="Category" value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"/>
      </label>
      <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-3">
        <MapPin size={18} className="text-neutral-300"/><input aria-label="Location" value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Location" className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"/>
      </label>
      <button type="submit" className="rounded-md bg-indigo-600 px-6 text-sm font-medium hover:bg-indigo-500">Search</button>
      <div className="col-span-full mt-1 text-xs text-neutral-300">Trending: Electronics • Textiles • Machinery • Chemicals</div>
    </form>
  );
}
