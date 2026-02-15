import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuccessStories } from '../SuccessStories';

const mockTestimonials = [
  {
    id: 'testimonial-1',
    name: 'John Doe',
    role: 'Procurement Manager',
    company: 'Tech Corp',
    avatar: '/avatars/john-doe.jpg',
    content: 'Bell24H has transformed our procurement process. The platform is intuitive and efficient.',
    rating: 5,
    date: new Date('2024-03-15'),
    category: 'Procurement'
  },
  {
    id: 'testimonial-2',
    name: 'Jane Smith',
    role: 'Supply Chain Director',
    company: 'Global Industries',
    avatar: '/avatars/jane-smith.jpg',
    content: 'The RFQ management system is excellent. We\'ve seen significant time savings.',
    rating: 4,
    date: new Date('2024-03-10'),
    category: 'Supply Chain'
  }
];

const mockSuccessStories = [
  {
    id: 'story-1',
    title: 'Streamlined Procurement Process',
    description: 'How Tech Corp reduced procurement time by 60% using Bell24H',
    metrics: [
      { value: '60%', label: 'Time Saved', change: 60 },
      { value: '45%', label: 'Cost Reduction', change: 45 },
      { value: '85%', label: 'User Satisfaction', change: 85 }
    ],
    company: {
      name: 'Tech Corp',
      logo: '/logos/tech-corp.png',
      industry: 'Technology'
    },
    date: new Date('2024-03-01'),
    tags: ['Procurement', 'Efficiency', 'Cost Reduction']
  },
  {
    id: 'story-2',
    title: 'Global Supply Chain Optimization',
    description: 'Global Industries achieved 40% faster supplier response times',
    metrics: [
      { value: '40%', label: 'Faster Response', change: 40 },
      { value: '30%', label: 'Cost Savings', change: 30 },
      { value: '90%', label: 'Supplier Satisfaction', change: 90 }
    ],
    company: {
      name: 'Global Industries',
      logo: '/logos/global-industries.png',
      industry: 'Manufacturing'
    },
    date: new Date('2024-02-15'),
    tags: ['Supply Chain', 'Global', 'Optimization']
  }
];

describe('SuccessStories', () => {
  const mockOnStoryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders testimonials tab by default', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('switches to success stories tab when clicked', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    const successStoriesTab = screen.getByRole('tab', { name: /success stories/i });
    fireEvent.click(successStoriesTab);

    expect(screen.getByText('Streamlined Procurement Process')).toBeInTheDocument();
    expect(screen.getByText('Global Supply Chain Optimization')).toBeInTheDocument();
  });

  it('displays testimonial details correctly', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    const testimonial = mockTestimonials[0];
    expect(screen.getByText(testimonial.name)).toBeInTheDocument();
    expect(screen.getByText(testimonial.role)).toBeInTheDocument();
    expect(screen.getByText(testimonial.company)).toBeInTheDocument();
    expect(screen.getByText(testimonial.content)).toBeInTheDocument();
    expect(screen.getByText(testimonial.category)).toBeInTheDocument();
  });

  it('displays success story details correctly', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    const successStoriesTab = screen.getByRole('tab', { name: /success stories/i });
    fireEvent.click(successStoriesTab);

    const story = mockSuccessStories[0];
    expect(screen.getByText(story.title)).toBeInTheDocument();
    expect(screen.getByText(story.description)).toBeInTheDocument();
    expect(screen.getByText(story.company.name)).toBeInTheDocument();
    expect(screen.getByText(story.company.industry)).toBeInTheDocument();

    story.metrics.forEach((metric) => {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
      expect(screen.getByText(metric.label)).toBeInTheDocument();
    });

    story.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('calls onStoryClick when a success story is clicked', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    const successStoriesTab = screen.getByRole('tab', { name: /success stories/i });
    fireEvent.click(successStoriesTab);

    const story = screen.getByText('Streamlined Procurement Process').closest('div');
    fireEvent.click(story!);

    expect(mockOnStoryClick).toHaveBeenCalledWith('story-1');
  });

  it('handles empty testimonials', () => {
    render(
      <SuccessStories
        testimonials={[]}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('handles empty success stories', () => {
    render(
      <SuccessStories
        testimonials={mockTestimonials}
        successStories={[]}
        onStoryClick={mockOnStoryClick}
      />
    );

    const successStoriesTab = screen.getByRole('tab', { name: /success stories/i });
    fireEvent.click(successStoriesTab);

    expect(screen.queryByText('Streamlined Procurement Process')).not.toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longTestimonial = {
      ...mockTestimonials[0],
      content: 'A'.repeat(500)
    };

    render(
      <SuccessStories
        testimonials={[longTestimonial]}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    expect(screen.getByText(longTestimonial.content)).toBeInTheDocument();
  });

  it('handles special characters in content', () => {
    const specialTestimonial = {
      ...mockTestimonials[0],
      content: 'Special !@#$%^&*() Characters',
      name: 'Special Name !@#$%^&*()'
    };

    render(
      <SuccessStories
        testimonials={[specialTestimonial]}
        successStories={mockSuccessStories}
        onStoryClick={mockOnStoryClick}
      />
    );

    expect(screen.getByText(specialTestimonial.content)).toBeInTheDocument();
    expect(screen.getByText(specialTestimonial.name)).toBeInTheDocument();
  });
}); 