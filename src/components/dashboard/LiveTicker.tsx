import React from 'react';
import { Video, Mic, Zap, CheckCircle } from 'lucide-react';

const mockActivities = [
  { id: 1, type: 'video', text: 'New Video RFQ: CNC Machinery Parts', location: 'Bengaluru', time: '2h ago' },
  { id: 2, type: 'voice', text: 'Voice RFQ: 1000 Cotton T-Shirts', location: 'Bhiwandi', time: '1h ago' },
  { id: 3, type: 'verified', text: 'Supplier Verified: Electronics Sector', location: 'Delhi', time: 'Just now' },
  { id: 4, type: 'text', text: 'Bulk Order: Industrial Solvents', location: 'Pune', time: '5h ago' },
];

export const LiveTicker = () => {
  return (
    <div className="w-full bg-[#1a1d27] border-y border-white/5 py-2 overflow-hidden flex items-center shadow-lg">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12 text-sm text-gray-400">
        {[...mockActivities, ...mockActivities].map((item, index) => (
          <div key={index} className="flex items-center gap-3 shrink-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400">
              {item.type === 'video' && <Video size={14} />}
              {item.type === 'voice' && <Mic size={14} />}
              {item.type === 'verified' && <CheckCircle size={14} className="text-yellow-500" />}
              {item.type === 'text' && <Zap size={14} />}
            </span>
            <span className="font-medium text-gray-200">{item.text}</span>
            <span className="text-xs text-gray-500">— {item.location}</span>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 uppercase">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
