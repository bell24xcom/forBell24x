'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, DollarSign, Activity, Globe } from 'lucide-react';
import Header from '@/components/Header';

export default function MarketDataPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Market Data" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Market Intelligence</h2>
          <p className="text-lg text-gray-600">Comprehensive market data and analytics for informed decision making</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Price Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">+12.5%</div>
              <p className="text-gray-600 mb-4">Steel prices trending upward this month</p>
              <Button className="w-full">View Trends</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Market Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">₹2.4Cr</div>
              <p className="text-gray-600 mb-4">Total transaction volume today</p>
              <Button className="w-full">View Volume</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
                Average Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">₹45,000</div>
              <p className="text-gray-600 mb-4">Per ton for steel products</p>
              <Button className="w-full">View Prices</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-orange-600" />
                Supplier Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">1,247</div>
              <p className="text-gray-600 mb-4">Active suppliers online now</p>
              <Button className="w-full">View Activity</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                Global Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600 mb-2">+8.2%</div>
              <p className="text-gray-600 mb-4">Global B2B growth rate</p>
              <Button className="w-full">View Global</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                Demand Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">92.5</div>
              <p className="text-gray-600 mb-4">High demand across categories</p>
              <Button className="w-full">View Demand</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
