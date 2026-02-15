'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

interface Solution {
  id: string;
  name: string;
  description: string;
  logo: string;
  features: string[];
  pricing: {
    monthly: number;
    annual: number;
    custom?: boolean;
  };
  rating: number;
  reviews: number;
}

interface SolutionComparisonProps {
  solutions: Solution[];
  features: Feature[];
  onSelect?: (solutionId: string) => void;
}

export const SolutionComparison: React.FC<SolutionComparisonProps> = ({
  solutions,
  features,
  onSelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getFeatureImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const categories = Array.from(
    new Set(features.map((feature) => feature.category))
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution) => (
          <Card key={solution.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={solution.logo}
                  alt={solution.name}
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <CardTitle className="text-lg">{solution.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {solution.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {formatPrice(solution.pricing.monthly)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(solution.pricing.annual)} billed annually
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < solution.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {solution.reviews} reviews
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelect?.(solution.id)}
                className="w-full"
                size="lg"
              >
                Select {solution.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Feature</TableHead>
                {solutions.map((solution) => (
                  <TableHead key={solution.id}>{solution.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <React.Fragment key={category}>
                  <TableRow>
                    <TableCell colSpan={solutions.length + 1}>
                      <Collapsible
                        open={expandedCategories.has(category)}
                        onOpenChange={() => toggleCategory(category)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 w-full">
                          {expandedCategories.has(category) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="font-semibold capitalize">
                            {category}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-4">
                            <Table>
                              <TableBody>
                                {features
                                  .filter((feature) => feature.category === category)
                                  .map((feature) => (
                                    <TableRow key={feature.id}>
                                      <TableCell className="w-[300px]">
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {feature.name}
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {feature.description}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`mt-1 w-fit ${getFeatureImportanceColor(
                                              feature.importance
                                            )}`}
                                          >
                                            {feature.importance}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                      {solutions.map((solution) => (
                                        <TableCell key={solution.id}>
                                          {solution.features.includes(
                                            feature.id
                                          ) ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                          ) : (
                                            <X className="h-5 w-5 text-red-500" />
                                          )}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}; 