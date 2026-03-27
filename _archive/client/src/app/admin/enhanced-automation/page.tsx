'use client';

import React from 'react';
import EnhancedAutomationPanel from '@/components/admin/enhanced-automation-panel';
import Header from '@/components/Header';

export default function EnhancedAutomationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Enhanced Automation Panel" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EnhancedAutomationPanel />
      </div>
    </div>
  );
}
