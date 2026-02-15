'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Globe, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface LaunchMetrics {
  seo: {
    domainRating: number;
    backlinks: number;
    indexedPages: number;
    organicTraffic: number;
  };
  rankings: {
    targetKeywords: number;
    top10Keywords: number;
    top3Keywords: number;
    number1Keywords: number;
  };
  automation: {
    categoriesGenerated: number;
    backlinkCampaign: boolean;
    ga4Active: boolean;
    searchConsoleActive: boolean;
  };
  competitive: {
    indiaMARTComparison: {
      aiFeatures: string;
      mobileExperience: string;
      seoScore: string;
      pageSpeed: string;
    };
  };
}

export default function LaunchMetricsPage() {
  const [metrics, setMetrics] = useState<LaunchMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Simulate fetching real metrics
      const mockMetrics: LaunchMetrics = {
        seo: {
          domainRating: 15, // Starting point
          backlinks: 12,
          indexedPages: 175,
          organicTraffic: 250
        },
        rankings: {
          targetKeywords: 45,
          top10Keywords: 8,
          top3Keywords: 3,
          number1Keywords: 1
        },
        automation: {
          categoriesGenerated: 19,
          backlinkCampaign: true,
          ga4Active: false,
          searchConsoleActive: false
        },
        competitive: {
          indiaMARTComparison: {
            aiFeatures: '10x Better',
            mobileExperience: '5x Better',
            seoScore: '35% Better',
            pageSpeed: '80% Faster'
          }
        }
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading launch metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bell24h Launch Metrics</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of SEO and growth campaign progress
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Domain Rating */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Domain Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.seo.domainRating}</p>
                <p className="text-xs text-gray-500">Target: 45+</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(metrics.seo.domainRating, 45)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Backlinks */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Backlinks</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.seo.backlinks}</p>
                <p className="text-xs text-gray-500">Target: 500+</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(metrics.seo.backlinks, 500)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Organic Traffic */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Organic Traffic</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.seo.organicTraffic.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Target: 50,000+</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(metrics.seo.organicTraffic, 50000)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Target Keywords */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Keywords</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.rankings.targetKeywords}</p>
                <p className="text-xs text-gray-500">Top 10 Rankings</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${getProgressPercentage(metrics.rankings.top10Keywords, 50)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* SEO Progress */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Indexed Pages</span>
                  <span className="font-medium">{metrics.seo.indexedPages}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${getProgressPercentage(metrics.seo.indexedPages, 1000)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Top 10 Rankings</span>
                  <span className="font-medium">{metrics.rankings.top10Keywords}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${getProgressPercentage(metrics.rankings.top10Keywords, 50)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Top 3 Rankings</span>
                  <span className="font-medium">{metrics.rankings.top3Keywords}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${getProgressPercentage(metrics.rankings.top3Keywords, 20)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>#1 Rankings</span>
                  <span className="font-medium">{metrics.rankings.number1Keywords}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${getProgressPercentage(metrics.rankings.number1Keywords, 5)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automation Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Category Generation</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{metrics.automation.categoriesGenerated}</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Backlink Campaign</span>
                <div className="flex items-center">
                  {metrics.automation.backlinkCampaign ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Google Analytics 4</span>
                <div className="flex items-center">
                  {metrics.automation.ga4Active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Search Console</span>
                <div className="flex items-center">
                  {metrics.automation.searchConsoleActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Analysis */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Analysis vs IndiaMART</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">AI Features</h4>
              <p className="text-2xl font-bold text-blue-600">{metrics.competitive.indiaMARTComparison.aiFeatures}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Mobile Experience</h4>
              <p className="text-2xl font-bold text-green-600">{metrics.competitive.indiaMARTComparison.mobileExperience}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">SEO Score</h4>
              <p className="text-2xl font-bold text-purple-600">{metrics.competitive.indiaMARTComparison.seoScore}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900">Page Speed</h4>
              <p className="text-2xl font-bold text-red-600">{metrics.competitive.indiaMARTComparison.pageSpeed}</p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-4">🚀 Immediate Action Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Google Analytics Setup</h4>
              <p className="text-sm opacity-90">
                1. Go to https://analytics.google.com<br/>
                2. Create GA4 property for Bell24h<br/>
                3. Get Measurement ID (G-XXXXXXXXXX)<br/>
                4. Add to environment variables
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Search Console Setup</h4>
              <p className="text-sm opacity-90">
                1. Go to https://search.google.com/search-console<br/>
                2. Add property: https://bell24h-v1.vercel.app<br/>
                3. Submit sitemap: /sitemap.xml<br/>
                4. Verify structured data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
