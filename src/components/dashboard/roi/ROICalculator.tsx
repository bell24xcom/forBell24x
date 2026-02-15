'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

interface ROICalculatorProps {
  onCalculate?: (results: ROICalculationResults) => void;
}

interface ROICalculationResults {
  annualSavings: number;
  timeToROI: number;
  threeYearROI: number;
  efficiencyGains: number;
  costReduction: number;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({ onCalculate }) => {
  const [annualSpend, setAnnualSpend] = useState<number>(1000000);
  const [procurementTime, setProcurementTime] = useState<number>(30);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<string>('basic');

  const results = useMemo(() => {
    // Calculate savings based on industry averages
    const timeSavings = (procurementTime * 0.4) / 100; // 40% time reduction
    const laborSavings = (teamSize * 50000 * 0.3); // 30% labor cost reduction
    const processSavings = annualSpend * 0.15; // 15% process cost reduction

    const annualSavings = laborSavings + processSavings;
    const timeToROI = 12 / (annualSavings / 50000); // Assuming $50k annual subscription
    const threeYearROI = (annualSavings * 3 - 150000) / 150000 * 100;
    const efficiencyGains = timeSavings * 100;
    const costReduction = ((laborSavings + processSavings) / annualSpend) * 100;

    return {
      annualSavings,
      timeToROI,
      threeYearROI,
      efficiencyGains,
      costReduction
    };
  }, [annualSpend, procurementTime, teamSize]);

  const handleCalculate = () => {
    onCalculate?.(results);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annual-spend">Annual Procurement Spend</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="annual-spend"
                    type="number"
                    value={annualSpend}
                    onChange={(e) => setAnnualSpend(Number(e.target.value))}
                    className="w-full"
                  />
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {formatCurrency(annualSpend)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="procurement-time">
                  Average Procurement Time (days)
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="procurement-time"
                    value={[procurementTime]}
                    onValueChange={([value]) => setProcurementTime(value)}
                    min={1}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {procurementTime} days
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-size">Procurement Team Size</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="team-size"
                    value={[teamSize]}
                    onValueChange={([value]) => setTeamSize(value)}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {teamSize} people
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Efficiency Gains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatPercentage(results.efficiencyGains)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reduction in procurement time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatPercentage(results.costReduction)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Overall cost savings
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Annual Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(results.annualSavings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Estimated yearly savings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time to ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {results.timeToROI.toFixed(1)} months
                </p>
                <p className="text-xs text-muted-foreground">
                  Break-even period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  3-Year ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatPercentage(results.threeYearROI)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Return on investment
                </p>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full"
            size="lg"
          >
            Calculate ROI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 