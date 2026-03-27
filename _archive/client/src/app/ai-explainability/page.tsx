'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import Header from '@/components/Header';

export default function AIExplainabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Explainability" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Explainability Dashboard</h2>
          <p className="text-lg text-gray-600">Understand how our AI makes decisions and recommendations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                SHAP Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">SHAP values explain individual predictions by showing how each feature contributes to the outcome.</p>
              <Button className="w-full">View SHAP Analysis</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                LIME Explanations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Local Interpretable Model-agnostic Explanations for understanding complex AI decisions.</p>
              <Button className="w-full">View LIME Analysis</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Feature Importance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Understand which features are most important in our AI matching algorithm.</p>
              <Button className="w-full">View Feature Importance</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-orange-600" />
                Trust Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Transparent trust scoring system explaining supplier verification decisions.</p>
              <Button className="w-full">View Trust Scores</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-red-600" />
                Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Real-time performance metrics and accuracy of our AI models.</p>
              <Button className="w-full">View Performance</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                Decision Trees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Visualize decision paths and reasoning behind AI recommendations.</p>
              <Button className="w-full">View Decision Trees</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
