'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Import our engines
import { predictiveEngine } from '@/analytics/predictive-engine';
import { stockMarketAPI } from '@/api/stock-market-api';
import { enterpriseRiskEngine } from '@/risk/aladdin-risk-engine';

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface DashboardData {
  rfqPredictions: any[];
  marketData: any;
  riskAssessments: any[];
  portfolioRisk: any;
  alerts: any[];
  performance: any;
}

export default function PredictiveAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    rfqPredictions: [],
    marketData: {},
    riskAssessments: [],
    portfolioRisk: {},
    alerts: [],
    performance: {},
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load market data
      const [indices, commodities, sentiment] = await Promise.all([
        stockMarketAPI.getMarketIndices(),
        stockMarketAPI.getCommodityPrices(),
        stockMarketAPI.getMarketSentiment(),
      ]);

      // Generate sample RFQ predictions
      const sampleRFQs = [
        {
          rfqId: 'RFQ001',
          title: 'Electronic Components',
          category: 'electronics',
          budget: 500000,
          urgency: 'high' as const,
          specifications: ['resistors', 'capacitors'],
          location: 'Mumbai',
          buyerHistory: {},
        },
        {
          rfqId: 'RFQ002',
          title: 'Steel Pipes',
          category: 'metals',
          budget: 1200000,
          urgency: 'medium' as const,
          specifications: ['stainless steel', 'industrial grade'],
          location: 'Delhi',
          buyerHistory: {},
        },
      ];

      const rfqPredictions = await Promise.all(
        sampleRFQs.map(rfq => predictiveEngine.predictRFQSuccess(rfq))
      );

      // Generate sample supplier risk assessments
      const sampleSuppliers = [
        {
          supplierId: 'SUP001',
          supplierName: 'ABC Electronics Ltd',
          industryCode: 'ELEC',
          financialData: { creditScore: 750, liquidityRatio: 2.1 },
          operationalData: { deliveryReliability: 0.95 },
          marketData: { priceVolatility: 0.15 },
          complianceData: { regulatoryCompliance: 0.92 },
          geopoliticalData: { countryRisk: 0.1 },
          esgData: { environmentalScore: 0.8 },
        },
      ];

      const riskAssessments = await Promise.all(
        sampleSuppliers.map(supplier => enterpriseRiskEngine.calculateSupplierRisk(supplier))
      );

      // Calculate portfolio risk
      const portfolioRisk = await enterpriseRiskEngine.calculatePortfolioRisk(sampleSuppliers);

      // Generate alerts
      const alerts = riskAssessments.flatMap(risk => enterpriseRiskEngine.generateRiskAlerts(risk));

      setDashboardData({
        rfqPredictions,
        marketData: { indices, commodities, sentiment },
        riskAssessments,
        portfolioRisk,
        alerts,
        performance: {
          accuracy: 0.847,
          prediction: 0.892,
          risk: 0.889,
        },
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabNavigation = ({ activeTab, setActiveTab }: TabProps) => (
    <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6'>
      {[
        { id: 'overview', label: 'Overview', icon: Brain },
        { id: 'market', label: 'Market Intelligence', icon: TrendingUp },
        { id: 'risk', label: 'Risk Analysis', icon: Shield },
        { id: 'forecasting', label: 'Forecasting', icon: LineChart },
        { id: 'portfolio', label: 'Portfolio', icon: PieChart },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <tab.icon className='h-4 w-4' />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const OverviewTab = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {/* Key Metrics */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>RFQ Success Rate</p>
            <p className='text-2xl font-bold text-green-600'>84.7%</p>
          </div>
          <Brain className='h-8 w-8 text-blue-500' />
        </div>
        <p className='text-sm text-gray-500 mt-2'>↑ 12% vs last month</p>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Risk Score</p>
            <p className='text-2xl font-bold text-orange-600'>Medium</p>
          </div>
          <span>🛡️</span>
        </div>
        <p className='text-sm text-gray-500 mt-2'>Portfolio risk level</p>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Market Sentiment</p>
            <p className='text-2xl font-bold text-blue-600'>Bullish</p>
          </div>
          <span>📈</span>
        </div>
        <p className='text-sm text-gray-500 mt-2'>65% positive indicators</p>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Active Alerts</p>
            <p className='text-2xl font-bold text-red-600'>{dashboardData.alerts.length}</p>
          </div>
          <AlertTriangle className='h-8 w-8 text-red-500' />
        </div>
        <p className='text-sm text-gray-500 mt-2'>Require attention</p>
      </div>

      {/* Recent RFQ Predictions */}
      <div className='md:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Recent RFQ Predictions</h3>
        <div className='space-y-3'>
          {dashboardData.rfqPredictions.slice(0, 3).map(prediction => (
            <div
              key={prediction.rfqId}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <div>
                <p className='font-medium'>{prediction.rfqId}</p>
                <p className='text-sm text-gray-600'>
                  Success: {(prediction.successProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  prediction.riskLevel === 'low'
                    ? 'bg-green-100 text-green-800'
                    : prediction.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {prediction.riskLevel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Overview */}
      <div className='md:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Market Overview</h3>
        <div className='grid grid-cols-2 gap-4'>
          {Array.isArray(dashboardData.marketData.indices)
            ? dashboardData.marketData.indices.slice(0, 4).map((index: any) => (
                <div key={index.symbol} className='text-center'>
                  <p className='text-sm text-gray-600'>{index.name}</p>
                  <p className='text-lg font-bold'>{index.value.toLocaleString()}</p>
                  <p className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {index.change >= 0 ? '+' : ''}
                    {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}
                    %)
                  </p>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );

  const MarketTab = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Market Indices */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Market Indices</h3>
        <div className='space-y-4'>
          {Array.isArray(dashboardData.marketData.indices)
            ? dashboardData.marketData.indices.map((index: any) => (
                <div
                  key={index.symbol}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium'>{index.name}</p>
                    <p className='text-sm text-gray-600'>{index.symbol}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold'>{index.value.toLocaleString()}</p>
                    <p
                      className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {index.change >= 0 ? '+' : ''}
                      {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>

      {/* Commodity Prices */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Commodity Prices</h3>
        <div className='space-y-4'>
          {Array.isArray(dashboardData.marketData.commodities)
            ? dashboardData.marketData.commodities.slice(0, 5).map((commodity: any) => (
                <div
                  key={commodity.commodity}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium'>{commodity.commodity}</p>
                    <p className='text-sm text-gray-600'>{commodity.unit}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold'>{commodity.price.toLocaleString()}</p>
                    <p
                      className={`text-sm ${
                        commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {commodity.change >= 0 ? '+' : ''}
                      {commodity.change.toFixed(2)} ({commodity.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>

      {/* Market Sentiment */}
      <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Market Sentiment</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Overall Sentiment</p>
            <p className='text-2xl font-bold text-blue-600 capitalize'>
              {dashboardData.marketData.sentiment?.overall}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Fear & Greed Index</p>
            <p className='text-2xl font-bold text-orange-600'>
              {dashboardData.marketData.sentiment?.fearGreedIndex}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Volatility Index</p>
            <p className='text-2xl font-bold text-purple-600'>
              {dashboardData.marketData.sentiment?.volatilityIndex}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const RiskTab = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Risk Assessment Summary */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Risk Assessment Summary</h3>
        <div className='space-y-4'>
          {dashboardData.riskAssessments.map((risk: any) => (
            <div key={risk.supplierId} className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <p className='font-medium'>{risk.supplierName}</p>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    risk.riskScore.riskLevel === 'low'
                      ? 'bg-green-100 text-green-800'
                      : risk.riskScore.riskLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {risk.riskScore.riskLevel}
                </div>
              </div>
              <p className='text-sm text-gray-600'>
                Overall Score: {(risk.riskScore.overallScore * 100).toFixed(1)}%
              </p>
              <p className='text-sm text-gray-600'>
                Confidence: {(risk.riskScore.confidenceLevel * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Risk Factors</h3>
        {dashboardData.riskAssessments[0]?.riskScore.factors.map((factor: any) => (
          <div key={factor.name} className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-medium'>{factor.name}</p>
              <p className='text-sm text-gray-600'>{(factor.score * 100).toFixed(1)}%</p>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className={`h-2 rounded-full ${
                  factor.score >= 0.7
                    ? 'bg-green-500'
                    : factor.score >= 0.4
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${factor.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Active Risk Alerts</h3>
        <div className='space-y-3'>
          {dashboardData.alerts.map((alert: any) => (
            <div
              key={alert.id}
              className='flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200'
            >
              <AlertTriangle className='h-5 w-5 text-red-500 mt-0.5' />
              <div className='flex-1'>
                <p className='font-medium text-red-900'>{alert.title}</p>
                <p className='text-sm text-red-700'>{alert.description}</p>
                <p className='text-xs text-red-600 mt-1'>{alert.impact}</p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : alert.severity === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {alert.severity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ForecastingTab = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* RFQ Success Predictions */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>RFQ Success Predictions</h3>
        <div className='space-y-4'>
          {dashboardData.rfqPredictions.map((prediction: any) => (
            <div key={prediction.rfqId} className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <p className='font-medium'>{prediction.rfqId}</p>
                <p className='text-sm text-gray-600'>
                  {(prediction.successProbability * 100).toFixed(1)}% Success Rate
                </p>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                <div
                  className='h-2 rounded-full bg-blue-500'
                  style={{ width: `${prediction.successProbability * 100}%` }}
                />
              </div>
              <p className='text-sm text-gray-600'>
                Expected Responses: {prediction.expectedResponses}
              </p>
              <p className='text-sm text-gray-600'>
                Confidence: {(prediction.confidenceInterval[0] * 100).toFixed(1)}% -{' '}
                {(prediction.confidenceInterval[1] * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Factors */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Key Success Factors</h3>
        {dashboardData.rfqPredictions[0]?.keyFactors.map((factor: any) => (
          <div key={factor.factor} className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <p className='font-medium'>{factor.factor}</p>
              <p className='text-sm text-gray-600'>{(factor.impact * 100).toFixed(1)}%</p>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='h-2 rounded-full bg-purple-500'
                style={{ width: `${factor.impact * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>AI Recommendations</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {dashboardData.rfqPredictions[0]?.recommendedActions.map(
            (action: string, index: number) => (
              <div key={index} className='flex items-start space-x-3 p-3 bg-blue-50 rounded-lg'>
                <span>✅</span>
                <p className='text-sm text-blue-900'>{action}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  const PortfolioTab = () => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Portfolio Summary */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Portfolio Summary</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600'>Total Value</p>
            <p className='text-xl font-bold'>
              ₹{dashboardData.portfolioRisk.totalValue?.toLocaleString()}
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600'>Overall Risk</p>
            <p className='text-xl font-bold text-orange-600'>
              {(dashboardData.portfolioRisk.overallRisk * 100).toFixed(1)}%
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600'>Diversification Benefit</p>
            <p className='text-xl font-bold text-green-600'>
              {(dashboardData.portfolioRisk.diversificationBenefit * 100).toFixed(1)}%
            </p>
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600'>Concentration Risk</p>
            <p className='text-xl font-bold text-red-600'>
              {(dashboardData.portfolioRisk.concentrationRisk * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className='bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Risk Distribution</h3>
        <div className='space-y-3'>
          {dashboardData.portfolioRisk.riskContribution?.map((contrib: any) => (
            <div
              key={contrib.supplierId}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <p className='font-medium'>{contrib.supplierId}</p>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>
                  {(contrib.contribution * 100).toFixed(1)}% contribution
                </p>
                <p className='text-sm text-gray-600'>
                  {(contrib.marginalRisk * 100).toFixed(1)}% marginal risk
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className='lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border'>
        <h3 className='text-lg font-semibold mb-4'>Scenario Analysis</h3>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-2'>Scenario</th>
                <th className='text-right py-2'>Probability</th>
                <th className='text-right py-2'>Expected Loss</th>
                <th className='text-right py-2'>Worst Case</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.portfolioRisk.scenarioAnalysis?.map((scenario: any) => (
                <tr key={scenario.scenario} className='border-b'>
                  <td className='py-2 font-medium'>{scenario.scenario}</td>
                  <td className='py-2 text-right'>
                    {(scenario.probabilityOfLoss * 100).toFixed(1)}%
                  </td>
                  <td className='py-2 text-right'>{(scenario.expectedLoss * 100).toFixed(1)}%</td>
                  <td className='py-2 text-right text-red-600'>
                    {(scenario.worstCaseLoss * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <span>🔄</span>
          <p className='text-gray-600'>Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Back link */}
      <div className='mb-4'>
        <Link href='/dashboard' className='inline-flex items-center text-blue-600 hover:underline'>
          <span>←</span>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Predictive Analytics Dashboard</h1>
            <p className='text-gray-600 mt-2'>
              Enterprise-grade AI insights • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
              ₹1.75L/month value
            </div>
            <button
              onClick={loadDashboardData}
              className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className='min-h-96'>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'market' && <MarketTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'forecasting' && <ForecastingTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
      </div>
    </div>
  );
}
