'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Zap,
  Target,
  MessageSquare,
  Mail,
  Smartphone,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function AutonomousSystemPage() {
  const [systemStatus, setSystemStatus] = useState('ACTIVE');
  const [scrapingStats, setScrapingStats] = useState({
    totalCompanies: 4000,
    categoriesCompleted: 400,
    lastScraped: new Date().toISOString(),
    nextScheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  });
  const [marketingStats, setMarketingStats] = useState({
    totalCampaigns: 0,
    messagesSent: 0,
    successRate: 95.5,
    totalValue: 0
  });
  const [claimStats, setClaimStats] = useState({
    totalClaims: 0,
    earlyUsers: 0,
    totalValue: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const startAutonomousSystem = async () => {
    try {
      console.log('🚀 Starting autonomous system...');
      setSystemStatus('STARTING');
      
      // Start scraping
      await fetch('/api/n8n/autonomous/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'All', source: 'Auto' })
      });

      // Start marketing
      await fetch('/api/marketing/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType: 'SMS',
          targetCompanies: [],
          messageData: { message: 'Welcome to Bell24h!' }
        })
      });

      setSystemStatus('ACTIVE');
    } catch (error) {
      console.error('❌ Failed to start autonomous system:', error);
      setSystemStatus('ERROR');
    }
  };

  const stopAutonomousSystem = () => {
    setSystemStatus('PAUSED');
    console.log('⏸️ Autonomous system paused');
  };

  const refreshStats = async () => {
    try {
      setIsLoading(true);
      
      // Use test API for reliable data
      try {
        const testResponse = await fetch('/api/test/autonomous-system?type=all');
        const testData = await testResponse.json();
        
        if (testData.success && testData.data) {
          // Update scraping stats
          if (testData.data.scraping) {
            setScrapingStats(prev => ({
              ...prev,
              ...testData.data.scraping
            }));
          }

          // Update marketing stats
          if (testData.data.marketing) {
            setMarketingStats(prev => ({
              ...prev,
              ...testData.data.marketing
            }));
          }

          // Update claim stats
          if (testData.data.claims) {
            setClaimStats(prev => ({
              ...prev,
              ...testData.data.claims
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch test data:', error);
        
        // Fallback to individual APIs
        try {
          const scrapingResponse = await fetch('/api/n8n/autonomous/scrape');
          const scrapingData = await scrapingResponse.json();
          if (scrapingData.success && scrapingData.data) {
            setScrapingStats(prev => ({
              ...prev,
              ...scrapingData.data
            }));
          }
        } catch (error) {
          console.error('Failed to fetch scraping stats:', error);
        }

        try {
          const marketingResponse = await fetch('/api/marketing/autonomous');
          const marketingData = await marketingResponse.json();
          if (marketingData.success && marketingData.data) {
            setMarketingStats(prev => ({
              ...prev,
              ...marketingData.data
            }));
          }
        } catch (error) {
          console.error('Failed to fetch marketing stats:', error);
        }

        try {
          const claimResponse = await fetch('/api/claim/automatic');
          const claimData = await claimResponse.json();
          if (claimData.success && claimData.data) {
            setClaimStats(prev => ({
              ...prev,
              ...claimData.data
            }));
          }
        } catch (error) {
          console.error('Failed to fetch claim stats:', error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize with default values and then refresh
    setIsLoading(false);
    refreshStats();
    const interval = setInterval(refreshStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Bell24h Autonomous System
          </h1>
          <p className="text-xl text-gray-700">
            AI-Powered Business Data Scraping & Marketing Empire
          </p>
        </div>

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Monitor your autonomous scraping and marketing system
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={systemStatus === 'ACTIVE' ? 'default' : systemStatus === 'PAUSED' ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {systemStatus === 'ACTIVE' ? (
                    <><CheckCircle className="h-4 w-4 mr-1" /> ACTIVE</>
                  ) : systemStatus === 'PAUSED' ? (
                    <><Pause className="h-4 w-4 mr-1" /> PAUSED</>
                  ) : (
                    <><AlertCircle className="h-4 w-4 mr-1" /> ERROR</>
                  )}
                </Badge>
                <Button onClick={refreshStats} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {systemStatus === 'ACTIVE' ? (
                <Button onClick={stopAutonomousSystem} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause System
                </Button>
              ) : (
                <Button onClick={startAutonomousSystem}>
                  <Play className="h-4 w-4 mr-2" />
                  Start System
                </Button>
              )}
              <Button onClick={refreshStats} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scraping">Scraping</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? 'Loading...' : (scrapingStats.totalCompanies || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {scrapingStats.categoriesCompleted || 400} categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? 'Loading...' : (marketingStats.messagesSent || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {marketingStats.successRate || 95.5}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Early Users</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? 'Loading...' : (claimStats.earlyUsers || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {claimStats.conversionRate || 0}% conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{isLoading ? 'Loading...' : (claimStats.totalValue || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Early user benefits distributed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Projection
                </CardTitle>
                <CardDescription>
                  Expected annual revenue from autonomous system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">₹8.6L</div>
                    <div className="text-sm text-gray-600">Conservative Estimate</div>
                    <div className="text-xs text-gray-500">2% conversion rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">₹15.1L</div>
                    <div className="text-sm text-gray-600">Expected Revenue</div>
                    <div className="text-xs text-gray-500">3.5% conversion rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">₹21.6L</div>
                    <div className="text-sm text-gray-600">Optimistic Estimate</div>
                    <div className="text-xs text-gray-500">5% conversion rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scraping Tab */}
          <TabsContent value="scraping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Autonomous Scraping System
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of company data scraping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Scraping Schedule</h4>
                    <p className="text-sm text-gray-600">Every 6 hours</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Companies per Category</h4>
                    <p className="text-sm text-gray-600">10 companies</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Last Scraped</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(scrapingStats.lastScraped).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Next Scheduled</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(scrapingStats.nextScheduled).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Marketing Automation
                </CardTitle>
                <CardDescription>
                  SMS, Email, and WhatsApp campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Smartphone className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-medium">SMS Campaigns</h4>
                      <p className="text-sm text-gray-600">MSG91 Integration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Mail className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Email Campaigns</h4>
                      <p className="text-sm text-gray-600">Resend Integration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium">WhatsApp Campaigns</h4>
                      <p className="text-sm text-gray-600">Business API</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Early User Benefits
                </CardTitle>
                <CardDescription>
                  Founder's Club benefits and claim management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">FREE Lifetime Basic Plan</h4>
                    <p className="text-sm text-gray-600">Value: ₹12,000 per user</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">6 Months Premium FREE</h4>
                    <p className="text-sm text-gray-600">Value: ₹18,000 per user</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Early User Badge</h4>
                    <p className="text-sm text-gray-600">Founder Member Status</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Priority Support</h4>
                    <p className="text-sm text-gray-600">2-hour response time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
