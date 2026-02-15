import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface FeaturedRFQ {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  budget: string;
  deadline: Date;
  isFeatured: boolean;
}

interface TrendingCategory {
  id: string;
  name: string;
  growth: number;
  activeRfqs: number;
}

interface FeaturedContentProps {
  featuredRfqs: FeaturedRFQ[];
  trendingCategories: TrendingCategory[];
  onRfqClick: (rfqId: string) => void;
  onCategoryClick: (categoryId: string) => void;
}

export const FeaturedContent: React.FC<FeaturedContentProps> = ({
  featuredRfqs,
  trendingCategories,
  onRfqClick,
  onCategoryClick,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Featured Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="featured" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Featured RFQs</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Categories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-4">
            {featuredRfqs.map((rfq) => (
              <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{rfq.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rfq.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {rfq.budget}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{rfq.category}</Badge>
                        <Badge variant="outline">{rfq.subcategory}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">
                          Due {format(rfq.deadline, 'MMM d, yyyy')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRfqClick(rfq.id)}
                          className="flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {trendingCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{category.activeRfqs} Active RFQs</span>
                        <span>•</span>
                        <span className="text-green-600">
                          +{category.growth}% growth
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCategoryClick(category.id)}
                      className="flex items-center space-x-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 