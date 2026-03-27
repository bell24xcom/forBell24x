"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ABTestStats {
  variant: string;
  total_sent: number;
  total_converted: number;
  conversion_rate: number;
  data_points: Array<{
    time: string;
    conversion_rate: number;
    sent: number;
    converted: number;
  }>;
}

export default function ABTestDashboard() {
  const [stats, setStats] = useState<ABTestStats[]>([]);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/ab-test/stats?hours=24");
      const data = await response.json();
      setStats(data.stats || []);
      setActiveVariant(data.active_variant);
      setWinner(data.winner);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching A/B test stats:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading A/B test statistics...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">A/B Test Dashboard</h1>
        <div className="text-sm text-gray-500">
          Auto-updates every 2 hours | Last 24 hours
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((variant) => (
          <Card key={variant.variant}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{variant.variant === "variant_a" ? "₹5,000 Credit" : "50 Inquiries"}</span>
                {variant.variant === activeVariant && (
                  <span className="text-sm bg-green-500 text-white px-2 py-1 rounded">ACTIVE</span>
                )}
                {variant.variant === winner && (
                  <span className="text-sm bg-yellow-500 text-white px-2 py-1 rounded">WINNER</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {(variant.conversion_rate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">Conversion Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-semibold">{variant.total_sent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Sent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{variant.total_converted.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Converted</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Graph (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Conversion rate over time graph (integrate with charting library)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

