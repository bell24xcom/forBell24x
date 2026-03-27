// Bell24h 2.0 - Napkin-style PDF Generator
// AI-powered RFQ analysis reports with charts and visualizations

export interface RFQAnalysisData {
  rfqId: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  budget?: number;
  deadline?: Date;
  
  // AI Analysis Results
  priceTrend: PriceTrendData;
  riskScore: number;
  competitorAnalysis: CompetitorData[];
  aiRecommendations: string[];
  marketInsights: MarketInsight[];
  
  // Supplier Responses
  responses: RFQResponseData[];
}

export interface PriceTrendData {
  dates: string[];
  prices: number[];
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  marketAverage: number;
}

export interface CompetitorData {
  name: string;
  price: number;
  rating: number;
  deliveryTime: number;
  riskScore: number;
}

export interface MarketInsight {
  type: 'price' | 'demand' | 'supply' | 'risk';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface RFQResponseData {
  supplierId: string;
  supplierName: string;
  price: number;
  quantity: number;
  deliveryTime: number;
  aiScore: number;
  riskScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
}

/**
 * Generate Napkin-style PDF report for RFQ analysis
 */
export async function generateRFQReport(rfqData: RFQAnalysisData): Promise<Blob> {
  try {
    const response = await fetch('/api/rfq/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rfqData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate RFQ report');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating RFQ report:', error);
    throw error;
  }
}

/**
 * Create chart data for price trend visualization
 */
export function createPriceTrendChart(data: PriceTrendData) {
  return {
    type: 'line',
    data: {
      labels: data.dates,
      datasets: [
        {
          label: 'Market Price',
          data: data.prices,
          borderColor: data.trend === 'up' ? '#10B981' : data.trend === 'down' ? '#EF4444' : '#6B7280',
          backgroundColor: data.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : data.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Market Average',
          data: Array(data.prices.length).fill(data.marketAverage),
          borderColor: '#8B5CF6',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '30-Day Price Trend Analysis',
        },
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Price (₹)',
          },
        },
      },
    },
  };
}

/**
 * Create radar chart for supplier comparison
 */
export function createSupplierRadarChart(responses: RFQResponseData[]) {
  const labels = responses.map(r => r.supplierName);
  const prices = responses.map(r => r.price);
  const scores = responses.map(r => r.aiScore);
  const risks = responses.map(r => r.riskScore);
  const delivery = responses.map(r => r.deliveryTime);

  return {
    type: 'radar',
    data: {
      labels: ['Price', 'AI Score', 'Risk Score', 'Delivery Time'],
      datasets: responses.map((response, index) => ({
        label: response.supplierName,
        data: [
          normalizePrice(prices[index], Math.min(...prices), Math.max(...prices)),
          scores[index],
          risks[index],
          normalizeDelivery(delivery[index]),
        ],
        borderColor: getSupplierColor(index),
        backgroundColor: `${getSupplierColor(index)}20`,
        pointBackgroundColor: getSupplierColor(index),
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Supplier Comparison Matrix',
        },
        legend: {
          position: 'top',
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  };
}

/**
 * Create heat map for risk assessment
 */
export function createRiskHeatmap(responses: RFQResponseData[]) {
  const riskLevels = ['Low', 'Medium', 'High'];
  const categories = ['Price Risk', 'Delivery Risk', 'Quality Risk', 'Financial Risk'];
  
  const data = responses.map(response => [
    calculatePriceRisk(response.price),
    calculateDeliveryRisk(response.deliveryTime),
    response.riskScore,
    calculateFinancialRisk(response.riskScore),
  ]);

  return {
    type: 'heatmap',
    data: {
      labels: responses.map(r => r.supplierName),
      datasets: categories.map((category, index) => ({
        label: category,
        data: data.map(row => row[index]),
        backgroundColor: data.map(row => getRiskColor(row[index])),
      })),
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Supplier Risk Assessment',
        },
        legend: {
          position: 'top',
        },
      },
    },
  };
}

/**
 * Generate AI recommendations text
 */
export function generateAIRecommendations(
  responses: RFQResponseData[],
  priceTrend: PriceTrendData,
  budget?: number
): string[] {
  const recommendations: string[] = [];
  
  // Sort responses by AI score
  const sortedResponses = responses.sort((a, b) => b.aiScore - a.aiScore);
  
  // Top recommendation
  if (sortedResponses.length > 0) {
    const top = sortedResponses[0];
    recommendations.push(
      `Accept ${top.supplierName} - AI Score: ${top.aiScore.toFixed(1)}/100, Price: ₹${top.price.toLocaleString()}`
    );
  }
  
  // Price trend recommendation
  if (priceTrend.trend === 'up') {
    recommendations.push(
      `Market prices are trending upward (${priceTrend.percentageChange.toFixed(1)}% increase). Consider expediting purchase.`
    );
  } else if (priceTrend.trend === 'down') {
    recommendations.push(
      `Market prices are declining (${Math.abs(priceTrend.percentageChange).toFixed(1)}% decrease). Consider waiting for better prices.`
    );
  }
  
  // Budget recommendation
  if (budget && sortedResponses.length > 0) {
    const avgPrice = sortedResponses.reduce((sum, r) => sum + r.price, 0) / sortedResponses.length;
    if (avgPrice > budget) {
      recommendations.push(
        `Average price (₹${avgPrice.toLocaleString()}) exceeds budget (₹${budget.toLocaleString()}). Consider negotiating or reducing quantity.`
      );
    }
  }
  
  // Risk recommendation
  const highRiskSuppliers = responses.filter(r => r.riskScore > 70);
  if (highRiskSuppliers.length > 0) {
    recommendations.push(
      `${highRiskSuppliers.length} supplier(s) have high risk scores. Consider additional due diligence.`
    );
  }
  
  return recommendations;
}

// Helper functions
function normalizePrice(price: number, min: number, max: number): number {
  return ((max - price) / (max - min)) * 100;
}

function normalizeDelivery(days: number): number {
  // Lower delivery time = higher score
  return Math.max(0, 100 - (days * 5));
}

function getSupplierColor(index: number): string {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  return colors[index % colors.length];
}

function getRiskColor(risk: number): string {
  if (risk < 30) return '#10B981'; // Green
  if (risk < 70) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

function calculatePriceRisk(price: number): number {
  // Simplified price risk calculation
  return Math.min(100, Math.max(0, (price - 1000) / 10));
}

function calculateDeliveryRisk(days: number): number {
  // Higher delivery time = higher risk
  return Math.min(100, days * 10);
}

function calculateFinancialRisk(riskScore: number): number {
  return riskScore; // Use existing risk score
}

/**
 * Download PDF report
 */
export async function downloadRFQReport(rfqId: string): Promise<void> {
  try {
    const response = await fetch(`/api/rfq/${rfqId}/report`);
    
    if (!response.ok) {
      throw new Error('Failed to download RFQ report');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rfq-analysis-${rfqId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading RFQ report:', error);
    throw error;
  }
}
