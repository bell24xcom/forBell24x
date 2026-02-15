import React from 'react';
import { Users, TrendingUp, Zap, Star, Brain, AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color?: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }: MetricCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
      <div className="mt-2">
        <span className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

export default function ComprehensiveDashboard() {
  const insights = [
    { type: 'market', title: 'Market Analysis', description: 'AI-powered market insights', id: 'market' },
    { type: 'recommendation', title: 'Recommendations', description: 'Smart supplier suggestions', id: 'recommendation' },
    { type: 'alert', title: 'Risk Alerts', description: 'Potential issues detected', id: 'alert' }
  ];

  const handleInsightClick = React.useCallback((insightId: string) => {
    console.log('Insight clicked:', insightId);
    // TODO: Implement insight navigation
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Comprehensive Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value="1,234"
          icon={Users}
          trend="+12%"
          color="blue"
        />
        <MetricCard
          title="Revenue"
          value="$45,678"
          icon={TrendingUp}
          trend="+8%"
          color="green"
        />
        <MetricCard
          title="Active RFQs"
          value="89"
          icon={Zap}
          trend="+15%"
          color="yellow"
        />
        <MetricCard
          title="Success Rate"
          value="94%"
          icon={Star}
          trend="+3%"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleInsightClick(insight.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInsightClick(insight.id);
              }
            }}
          >
            <div className="flex items-center mb-4">
              {insight.type === 'market' && <Brain className="h-6 w-6 text-blue-600 mr-3" />}
              {insight.type === 'recommendation' && <CheckCircle className="h-6 w-6 text-green-600 mr-3" />}
              {insight.type === 'alert' && <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />}
              <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
            </div>
            <p className="text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
