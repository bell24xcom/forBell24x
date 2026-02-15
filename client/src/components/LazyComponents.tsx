import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading skeletons for better UX
const SkeletonCard = () => (
  <div className='animate-pulse bg-white rounded-lg p-6 border border-gray-200'>
    <div className='bg-gray-200 h-4 rounded mb-2'></div>
    <div className='bg-gray-200 h-4 rounded w-3/4 mb-2'></div>
    <div className='bg-gray-200 h-4 rounded w-1/2'></div>
  </div>
);

const SkeletonTable = () => (
  <div className='animate-pulse bg-white rounded-lg p-6 border border-gray-200'>
    <div className='bg-gray-200 h-8 rounded mb-4'></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className='flex space-x-4 mb-2'>
        <div className='bg-gray-200 h-4 rounded flex-1'></div>
        <div className='bg-gray-200 h-4 rounded flex-1'></div>
        <div className='bg-gray-200 h-4 rounded flex-1'></div>
      </div>
    ))}
  </div>
);

const SkeletonChart = () => (
  <div className='animate-pulse bg-white rounded-lg p-6 border border-gray-200'>
    <div className='bg-gray-200 h-64 rounded'></div>
  </div>
);

// Lazy load heavy components with proper loading states
export const LazyVoiceRFQ = dynamic(() => import('../app/voice-rfq/page'), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

export const LazyTradingPlatform = dynamic(() => import('../app/trading/page'), {
  loading: () => <SkeletonChart />,
  ssr: false,
});

export const LazyESGDashboard = dynamic(() => import('../app/esg/page'), {
  loading: () => <SkeletonTable />,
  ssr: false,
});

export const LazyAnalytics = dynamic(() => import('../app/analytics/page'), {
  loading: () => <SkeletonChart />,
  ssr: false,
});

export const LazyCategories = dynamic(() => import('../app/categories/page'), {
  loading: () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(9)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  ),
  ssr: false,
});

export const LazyFinance = dynamic(() => import('../app/finance/page'), {
  loading: () => <SkeletonTable />,
  ssr: false,
});

export const LazyWallet = dynamic(() => import('../app/wallet/page'), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

// Wrapper with suspense for additional safety
export const LazyComponentWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SkeletonCard />}>{children}</Suspense>
);

// Export skeleton components for use elsewhere
export { SkeletonCard, SkeletonTable, SkeletonChart };
