'use client';

import { useState } from 'react';

interface RFQExplanationButtonProps {
  rfqId: string;
  rfqTitle: string;
  className?: string;
}

export default function RFQExplanationButton({
  rfqId,
  rfqTitle,
  className = '',
}: RFQExplanationButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const generateExplanation = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus('Initializing AI analysis...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Update status messages
      setTimeout(() => setStatus('Analyzing suppliers...'), 500);
      setTimeout(() => setStatus('Calculating risk scores...'), 1500);
      setTimeout(() => setStatus('Generating market insights...'), 2500);
      setTimeout(() => setStatus('Creating comprehensive report...'), 3500);

      // Call the API
      const response = await fetch('/api/rfq/explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfqId }),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('Downloading report...');

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RFQ-Explanation-${rfqTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('Report generated successfully!');
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStatus('');
      }, 2000);
    } catch (error) {
      console.error('Error generating explanation:', error);
      setStatus('Error generating report. Please try again.');
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStatus('');
      }, 3000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={generateExplanation}
        disabled={isGenerating}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${
            isGenerating
              ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isGenerating ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent'></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Generate AI Report</span>
          </>
        )}
      </button>

      {/* Progress Overlay */}
      {isGenerating && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50'>
          <div className='flex items-center space-x-3 mb-3'>
            <div className='flex-shrink-0'>
              {progress < 100 ? (
                <div className='animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent'></div>
              ) : (
                <span>✅</span>
              )}
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-900'>
                {progress < 100 ? 'Generating AI Analysis Report' : 'Report Ready!'}
              </p>
              <p className='text-xs text-gray-500'>{status}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Progress Percentage */}
          <div className='flex justify-between text-xs text-gray-500 mt-1'>
            <span>AI Analysis</span>
            <span>{progress}%</span>
          </div>

          {/* Features Preview */}
          <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
            <div className='flex items-center space-x-1 text-gray-600'>
              <span>📊</span>
              <span>Supplier Analysis</span>
            </div>
            <div className='flex items-center space-x-1 text-gray-600'>
              <span>📈</span>
              <span>Market Insights</span>
            </div>
            <div className='flex items-center space-x-1 text-gray-600'>
              <AlertTriangle className='w-3 h-3' />
              <span>Risk Assessment</span>
            </div>
            <div className='flex items-center space-x-1 text-gray-600'>
              <span>⬇️</span>
              <span>PDF Report</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
