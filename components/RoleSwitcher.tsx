'use client';

import { useState, useEffect } from 'react';

interface RoleSwitcherProps {
  currentRole: 'supplier' | 'buyer';
  onRoleChange: (role: 'supplier' | 'buyer') => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    {
      key: 'supplier',
      label: 'Supplier Mode',
      description: 'Sell products & services',
      icon: '🏢',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'buyer',
      label: 'Buyer Mode', 
      description: 'Source products & services',
      icon: '🛒',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const currentRoleData = roles.find(role => role.key === currentRole);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
          currentRole === 'supplier' 
            ? 'border-purple-300 bg-purple-50' 
            : 'border-green-300 bg-green-50'
        }`}
      >
        <span className="text-lg">{currentRoleData?.icon}</span>
        <div className="text-left">
          <div className="font-medium text-sm">{currentRoleData?.label}</div>
          <div className="text-xs text-gray-600">{currentRoleData?.description}</div>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">Switch Role</div>
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => {
                  onRoleChange(role.key as 'supplier' | 'buyer');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  currentRole === role.key 
                    ? 'bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{role.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{role.label}</div>
                  <div className="text-xs text-gray-600">{role.description}</div>
                </div>
                {currentRole === role.key && (
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t p-3 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-600 text-center">
              💡 You can switch roles anytime to both buy and sell
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
