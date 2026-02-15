import React from 'react';
import { Users, TrendingUp, Zap, Star } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Comprehensive Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
} 