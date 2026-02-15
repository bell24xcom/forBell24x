<<<<<<< HEAD
import { ALL_CATEGORIES } from './categories';

export interface MockRFQ {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  quantity: string;
  budget: string;
  timeline: string;
  location: string;
  rfqType: 'standard' | 'voice' | 'video';
  isDemo: true;
  disclaimer: string;
  postedBy: string;
  postedDate: string;
  responses: number;
  specifications: Record<string, string>;
  features?: string[];
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  paymentTerms?: string;
  deliveryTerms?: string;
  qualityCertifications?: string[];
  audioUrl?: string;
  videoUrl?: string;
=======
// Mock RFQ data for development and testing

export interface MockRFQ {
  id: number;
  title: string;
  description: string;
  category: string;
  quantity?: string;
  location: string;
  postedBy: string;
  postedAt: Date;
  postedDate: string; // ISO string for formatTimeAgo
  type: 'voice' | 'video' | 'text';
  rfqType: 'standard' | 'voice' | 'video'; // For LiveRFQFeed component
  status: 'active' | 'closed';
  quotesCount: number;
  responses?: number; // For LiveRFQFeed component
  budget?: string;
  timeline?: string;
  urgency?: string;
  audioUrl?: string; // For voice RFQs
  videoUrl?: string; // For video RFQs
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
  transcription?: string;
  aiAnalysis?: string;
}

<<<<<<< HEAD
// Indian business hubs for geographic distribution
const BUSINESS_HUBS = [
  { city: 'Mumbai', state: 'Maharashtra', weight: 25 },
  { city: 'Delhi', state: 'Delhi', weight: 20 },
  { city: 'Bangalore', state: 'Karnataka', weight: 15 },
  { city: 'Chennai', state: 'Tamil Nadu', weight: 10 },
  { city: 'Pune', state: 'Maharashtra', weight: 8 },
  { city: 'Kolkata', state: 'West Bengal', weight: 8 },
  { city: 'Ahmedabad', state: 'Gujarat', weight: 7 },
  { city: 'Hyderabad', state: 'Telangana', weight: 7 },
];

const COMPANY_NAMES = [
  'Tata Industries',
  'Reliance Corporation',
  'Mahindra Group',
  'L&T Limited',
  'Wipro Solutions',
  'Infosys Tech',
  'HCL Technologies',
  'Bajaj Holdings',
  'Godrej Industries',
  'Birla Corporation',
  'Jindal Steel',
  'Vedanta Limited',
  'Tech Mahindra',
  'Asian Paints',
  'UltraTech Cement',
  'HDFC Corporation',
];

function getWeightedRandom<T>(items: Array<T & { weight?: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight || 1;
    if (random <= 0) return item;
  }
  return items[0];
}

function getRandomLocation(): string {
  const hub = getWeightedRandom(BUSINESS_HUBS);
  return `${hub.city}, ${hub.state}`;
}

function getRandomCompany(): string {
  return COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
}

function getRandomBudget(min: number, max: number): string {
  const budget = Math.floor(Math.random() * (max - min) + min);
  if (budget < 100000) {
    return `₹${(budget / 1000).toFixed(0)}K - ₹${((budget * 1.3) / 1000).toFixed(0)}K`;
  } else {
    return `₹${(budget / 100000).toFixed(1)}L - ₹${((budget * 1.3) / 100000).toFixed(1)}L`;
  }
}

// Generate mock RFQs for all categories
export const generateAllMockRFQs = (): MockRFQ[] => {
  const mockRFQs: MockRFQ[] = [];

  ALL_CATEGORIES.forEach((category, categoryIndex) => {
    const rfqCount = category.trending ? 25 : 20;

    for (let i = 0; i < rfqCount; i++) {
      const rfqType = Math.random() < 0.7 ? 'standard' : Math.random() < 0.8 ? 'voice' : 'video';

      const mockRFQ: MockRFQ = {
        id: `rfq_${category.id}_${String(i + 1).padStart(3, '0')}`,
        category: category.name,
        subcategory:
          category.subcategories[Math.floor(Math.random() * category.subcategories.length)],
        title: `${category.name} - Professional Quality Requirements`,
        description: `Looking for high-quality ${category.name.toLowerCase()} for our business operations. Need reliable supplier with proven track record and competitive pricing.`,
        quantity: `${Math.floor(Math.random() * 1000) + 100} units`,
        budget: getRandomBudget(50000, 1000000),
        timeline: ['7 days', '15 days', '1 month', '2 months'][Math.floor(Math.random() * 4)],
        location: getRandomLocation(),
        rfqType: rfqType,
        isDemo: true,
        disclaimer: '🔍 DEMO CONTENT: This RFQ is created for demonstration purposes.',
        postedBy: `${getRandomCompany()} - Procurement Team`,
        postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        responses: Math.floor(Math.random() * 25),
        specifications: {
          Quality: 'Premium Grade',
          Certification: 'ISO Certified',
          Warranty: '1 Year',
          Support: '24/7 Technical Support',
        },
        features: ['Quality Assured', 'Competitive Pricing', 'Timely Delivery'],
        urgency: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)] as any,
        paymentTerms: Math.random() > 0.5 ? '30 days credit' : 'Advance payment',
        deliveryTerms: 'FOB destination',
        qualityCertifications: ['ISO 9001', 'CE Marking', 'BIS Certification'],
      };

      if (rfqType === 'voice') {
        mockRFQ.audioUrl = `/api/demo/audio/${mockRFQ.id}.mp3`;
        mockRFQ.transcription = 'Voice recording with detailed requirements...';
        mockRFQ.aiAnalysis = 'AI extracted specifications and requirements.';
      } else if (rfqType === 'video') {
        mockRFQ.videoUrl = `/api/demo/video/${mockRFQ.id}.mp4`;
        mockRFQ.transcription = 'Video showing product requirements and site conditions.';
        mockRFQ.aiAnalysis = 'AI video analysis identified key specifications.';
      }

      mockRFQs.push(mockRFQ);
    }
  });

  return mockRFQs;
};

export const getMockRFQsByCategory = (categoryId: string): MockRFQ[] => {
  const allRFQs = generateAllMockRFQs();
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  return allRFQs.filter(rfq => rfq.category === category?.name);
};

export const ALL_MOCK_RFQS = generateAllMockRFQs();

// RFQ Statistics
export const getMockRFQStats = () => {
  const allRFQs = ALL_MOCK_RFQS;
  return {
    total: allRFQs.length,
    categories: ALL_CATEGORIES.length,
    voiceRFQs: allRFQs.filter(rfq => rfq.rfqType === 'voice').length,
    videoRFQs: allRFQs.filter(rfq => rfq.rfqType === 'video').length,
    urgentRFQs: allRFQs.filter(rfq => rfq.urgency === 'Urgent').length,
    totalBudget: allRFQs.reduce((sum, rfq) => {
      const budget = rfq.budget.match(/₹([\d.]+)[KL]/);
      if (budget) {
        const value = parseFloat(budget[1]);
        const multiplier = budget[0].includes('L') ? 100000 : 1000;
        return sum + value * multiplier;
      }
      return sum;
    }, 0),
  };
};
=======
export const MOCK_RFQS: MockRFQ[] = [
  {
    id: 1,
    title: "Need 1000kg Steel Rods",
    description: "Required for construction project in Mumbai",
    category: "Building & Construction",
    quantity: "1000 kg",
    location: "Mumbai, Maharashtra",
    postedBy: "Rajesh Kumar",
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'text',
    rfqType: 'standard',
    status: 'active',
    quotesCount: 5,
    responses: 5,
    budget: "₹5L - ₹8L",
    timeline: "2 weeks"
  },
  {
    id: 2,
    title: "LED Bulbs - Bulk Order",
    description: "Need 500 LED bulbs for office",
    category: "Electronics & Electricals",
    quantity: "500 units",
    location: "Delhi, India",
    postedBy: "Priya Sharma",
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    postedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'voice',
    rfqType: 'voice',
    status: 'active',
    quotesCount: 8,
    responses: 8,
    budget: "₹2L - ₹3L",
    timeline: "1 week",
    audioUrl: "/api/demo/audio/sample-voice-rfq.mp3",
    transcription: "मुझे 500 LED बल्ब चाहिए ऑफिस के लिए",
    aiAnalysis: "Detected: LED Bulbs, 500 units, Office use"
  },
  {
    id: 3,
    title: "Industrial Machinery Parts",
    description: "Looking for CNC machine spare parts",
    category: "Industrial Machinery",
    quantity: "As per specs",
    location: "Pune, Maharashtra",
    postedBy: "Amit Patel",
    postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    postedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    type: 'video',
    rfqType: 'video',
    status: 'active',
    quotesCount: 3,
    responses: 3,
    budget: "₹20L - ₹30L",
    timeline: "3 weeks",
    videoUrl: "https://res.cloudinary.com/dcwhgtqld/video/upload/v1234567890/demo-rfq-video.mp4",
    aiAnalysis: "Detected: CNC machinery, Heavy-duty parts, Stainless steel components"
  },
  {
    id: 4,
    title: "Office Furniture Set",
    description: "Need complete office furniture for 50 employees",
    category: "Furniture & Home Decor",
    quantity: "50 sets",
    location: "Bangalore, Karnataka",
    postedBy: "Sneha Reddy",
    postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    type: 'text',
    rfqType: 'standard',
    status: 'active',
    quotesCount: 12,
    responses: 12,
    budget: "₹15L - ₹20L",
    timeline: "3 weeks"
  },
  {
    id: 5,
    title: "Organic Rice - 5000kg",
    description: "Premium quality organic rice needed",
    category: "Agriculture & Food Products",
    quantity: "5000 kg",
    location: "Hyderabad, Telangana",
    postedBy: "Venkat Rao",
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    type: 'text',
    rfqType: 'standard',
    status: 'active',
    quotesCount: 7,
    responses: 7,
    budget: "₹3L - ₹4L",
    timeline: "2 weeks"
  },
  {
    id: 6,
    title: "Cotton Fabric - 1000 meters",
    description: "High quality cotton fabric for garment manufacturing",
    category: "Textiles & Fabrics",
    quantity: "1000 meters",
    location: "Chennai, Tamil Nadu",
    postedBy: "Lakshmi Menon",
    postedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    postedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'voice',
    rfqType: 'voice',
    status: 'active',
    quotesCount: 15,
    responses: 15,
    budget: "₹4L - ₹6L",
    timeline: "1 week",
    audioUrl: "/api/demo/audio/sample-voice-rfq-2.mp3",
    transcription: "I need 1000 meters of high quality cotton fabric",
    aiAnalysis: "Detected: Cotton fabric, 1000 meters, Garment manufacturing"
  },
  {
    id: 7,
    title: "Solar Panels Installation",
    description: "Need solar panels for 5kW residential system",
    category: "Renewable Energy",
    quantity: "5kW system",
    location: "Ahmedabad, Gujarat",
    postedBy: "Mahesh Shah",
    postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    type: 'video',
    rfqType: 'video',
    status: 'active',
    quotesCount: 6,
    responses: 6,
    budget: "₹2.5L - ₹3.5L",
    timeline: "4 weeks",
    videoUrl: "https://res.cloudinary.com/dcwhgtqld/video/upload/v1234567890/solar-demo.mp4",
    aiAnalysis: "Detected: Solar panels, 5kW system, Residential installation"
  },
  {
    id: 8,
    title: "Plastic Raw Materials",
    description: "Require PP granules for injection molding",
    category: "Packaging & Paper",
    quantity: "2000 kg",
    location: "Kolkata, West Bengal",
    postedBy: "Arjun Das",
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: 'text',
    rfqType: 'standard',
    status: 'active',
    quotesCount: 9,
    responses: 9,
    budget: "₹1.5L - ₹2L",
    timeline: "1 week"
  },
  {
    id: 9,
    title: "Medical Equipment Supply",
    description: "Need hospital beds and medical furniture",
    category: "Healthcare Equipment",
    quantity: "20 units",
    location: "Jaipur, Rajasthan",
    postedBy: "Dr. Vikram Singh",
    postedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    type: 'text',
    rfqType: 'standard',
    status: 'active',
    quotesCount: 4,
    responses: 4,
    budget: "₹8L - ₹12L",
    timeline: "4 weeks",
    urgency: "Urgent"
  },
  {
    id: 10,
    title: "Car Batteries - 100 units",
    description: "Automotive batteries for fleet vehicles",
    category: "Automotive & Vehicles",
    quantity: "100 units",
    location: "Indore, Madhya Pradesh",
    postedBy: "Rahul Verma",
    postedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
    postedDate: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    type: 'voice',
    rfqType: 'voice',
    status: 'active',
    quotesCount: 11,
    responses: 11,
    budget: "₹6L - ₹8L",
    timeline: "2 weeks",
    audioUrl: "/api/demo/audio/sample-voice-rfq-3.mp3",
    transcription: "Need 100 car batteries for fleet vehicles",
    aiAnalysis: "Detected: Car batteries, 100 units, Fleet vehicles"
  }
];

// Helper function to get RFQs by category
export function getMockRFQsByCategory(category: string): MockRFQ[] {
  return MOCK_RFQS.filter(rfq => rfq.category === category);
}

// Helper function to get recent RFQs
export function getRecentRFQs(limit: number = 10): MockRFQ[] {
  return MOCK_RFQS
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .slice(0, limit);
}

// Helper function to get RFQ by ID
export function getMockRFQById(id: number): MockRFQ | undefined {
  return MOCK_RFQS.find(rfq => rfq.id === id);
}

// Helper function to get RFQs by type
export function getMockRFQsByType(type: 'voice' | 'video' | 'text'): MockRFQ[] {
  return MOCK_RFQS.filter(rfq => rfq.type === type);
}

// Helper function to get all mock RFQs (for compatibility)
export const ALL_MOCK_RFQS = MOCK_RFQS;

// Helper function to get mock RFQ statistics
export function getMockRFQStats() {
  return {
    total: MOCK_RFQS.length,
    voiceRFQs: MOCK_RFQS.filter(rfq => rfq.rfqType === 'voice').length,
    videoRFQs: MOCK_RFQS.filter(rfq => rfq.rfqType === 'video').length,
    standardRFQs: MOCK_RFQS.filter(rfq => rfq.rfqType === 'standard').length,
  };
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
