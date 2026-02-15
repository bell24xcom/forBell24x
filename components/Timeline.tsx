'use client';
import { motion } from 'framer-motion';
const steps=[{title:'Submit RFQ',desc:'Describe your requirement in minutes.'},{title:'AI Matching',desc:'We match you with verified suppliers.'},{title:'Secure Negotiation',desc:'Escrow-backed pricing and terms.'},{title:'Fulfillment',desc:'Delivery with milestone tracking.'}];
export default function Timeline(){
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">How Bell24h Works</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-4">
        {steps.map((s,i)=>(
          <motion.div key={s.title} initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-20% 0px -10% 0px'}} transition={{delay:i*0.05}} className="rounded-lg border border-white/10 bg-[#0b1220]/50 p-4">
            <div className="text-amber-300">{String(i+1).padStart(2,'0')}</div>
            <div className="mt-2 font-medium">{s.title}</div>
            <p className="mt-1 text-sm text-neutral-300">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
