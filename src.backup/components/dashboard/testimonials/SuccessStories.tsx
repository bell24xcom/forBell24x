import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  date: Date;
  category: string;
}

interface SuccessStory {
  id: string;
  title: string;
  description: string;
  metrics: {
    value: string;
    label: string;
    change: number;
  }[];
  company: {
    name: string;
    logo: string;
    industry: string;
  };
  date: Date;
  tags: string[];
}

interface SuccessStoriesProps {
  testimonials: Testimonial[];
  successStories: SuccessStory[];
  onStoryClick?: (storyId: string) => void;
}

export const SuccessStories: React.FC<SuccessStoriesProps> = ({
  testimonials,
  successStories,
  onStoryClick
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="testimonials" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="success-stories" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Success Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{testimonial.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {testimonial.date.toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="success-stories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {successStories.map((story) => (
              <Card
                key={story.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onStoryClick?.(story.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={story.company.logo}
                      alt={story.company.name}
                      className="h-12 w-12 object-contain"
                    />
                    <div>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {story.company.name} • {story.company.industry}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {story.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {story.metrics.map((metric, index) => (
                      <div key={index} className="text-center">
                        <p className="text-lg font-semibold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {metric.label}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <TrendingUp
                            className={`w-4 h-4 ${
                              metric.change >= 0
                                ? 'text-green-500'
                                : 'text-red-500 rotate-180'
                            }`}
                          />
                          <span
                            className={
                              metric.change >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }
                          >
                            {Math.abs(metric.change)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 