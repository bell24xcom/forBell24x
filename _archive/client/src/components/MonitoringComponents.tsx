import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const AnalyticsComponent = () => <Analytics />;
export const SpeedInsightsComponent = () => <SpeedInsights />;

export const MonitoringProvider = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Analytics />
    <SpeedInsights />
  </>
);
