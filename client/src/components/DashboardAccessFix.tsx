'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardAccessFix() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin/launch-metrics');
      return;
    }

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Fetch dashboard data
      const response = await fetch('/api/admin/launch-metrics', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/admin/launch-metrics')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-6">Launch Metrics Dashboard</h1>
      
      {dashboardData ? (
        <div className="dashboard-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Organic Traffic</h3>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.organicTraffic || '0'}
              </p>
            </div>
            
            <div className="metric-card">
              <h3>Domain Rating</h3>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.domainRating || '0'}
              </p>
            </div>
            
            <div className="metric-card">
              <h3>Backlinks</h3>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.backlinks || '0'}
              </p>
            </div>
            
            <div className="metric-card">
              <h3>Indexed Pages</h3>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData.indexedPages || '0'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      )}
    </div>
  );
}
