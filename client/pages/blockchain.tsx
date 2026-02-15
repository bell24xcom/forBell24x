import React from 'react';
import { Web3Provider } from '../lib/web3';
import { VoiceRFQ } from '../components/VoiceRFQ';
import { PredictiveAnalytics } from '../components/PredictiveAnalytics';
import { SupplierRiskScoring } from '../components/SupplierRiskScoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Mic, 
  BarChart3, 
  Shield, 
  Wallet, 
  TrendingUp, 
  Users,
  DollarSign,
  Zap
} from 'lucide-react';

export default function BlockchainPage() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Bell24h Blockchain Platform</h1>
                <Badge className="ml-3 bg-purple-100 text-purple-800">
                  <Zap className="h-3 w-3 mr-1" />
                  AI + Blockchain
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Wallet className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Connect Wallet to Access Features</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Feature Overview */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Revolutionary B2B Marketplace Features</h2>
            <p className="text-lg text-gray-600 mb-6">
              Experience the future of B2B commerce with AI-powered matching, blockchain escrow, and predictive analytics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Mic className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold">Voice RFQ</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Submit RFQs using voice commands powered by OpenAI Whisper
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold">Predictive Analytics</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    AI-powered insights with stock market integration
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold">Risk Scoring</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Aladin-inspired supplier risk assessment
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-8 w-8 text-orange-600 mr-3" />
                    <h3 className="text-lg font-semibold">Blockchain Escrow</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Secure milestone-based payments on Polygon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="voice-rfq" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="voice-rfq" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice RFQ
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="risk-scoring" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Scoring
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Blockchain
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice-rfq">
              <VoiceRFQ />
            </TabsContent>

            <TabsContent value="analytics">
              <PredictiveAnalytics />
            </TabsContent>

            <TabsContent value="risk-scoring">
              <SupplierRiskScoring />
            </TabsContent>

            <TabsContent value="blockchain">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Blockchain Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Smart Contracts</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• BellToken - Utility token with staking rewards</li>
                          <li>• BellEscrow - Milestone-based payment system</li>
                          <li>• BellVerification - NFT-based supplier verification</li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Network</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Polygon Network (Ethereum L2)</li>
                          <li>• Low gas fees and fast transactions</li>
                          <li>• EVM compatible smart contracts</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">₹156 Cr</div>
                        <div className="text-sm text-gray-600">369-Day Target</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">₹12.05 L</div>
                        <div className="text-sm text-gray-600">Monthly Target</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">50K+</div>
                        <div className="text-sm text-gray-600">Suppliers</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Web3Provider>
  );
}
