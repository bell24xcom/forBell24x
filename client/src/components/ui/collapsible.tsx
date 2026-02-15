'use client';

import React, { useState } from 'react';

interface CollapsibleProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapsible({
  children,
  trigger,
  defaultOpen = false,
  className = '',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors'
      >
        {trigger}
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className='p-4 border-t border-gray-200'>{children}</div>}
    </div>
  );
}

export default Collapsible;
