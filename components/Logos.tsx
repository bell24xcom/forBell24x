'use client';
const BRANDS=['Tata Steel','Reliance','Mahindra','L&T','Aditya Birla','JSW','BHEL','Bajaj','Hindalco','NTPC','IOC','GAIL'];
export default function Logos(){
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0b1220] to-transparent"/>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b1220] to-transparent"/>
      <div className="animate-[scroll_22s_linear_infinite] flex min-w-max gap-10 p-4 text-neutral-300">
        {[...BRANDS,...BRANDS].map((b,i)=><span key={i} className="whitespace-nowrap text-sm">{b}</span>)}
      </div>
      <style jsx>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
