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
  transcription?: string;
  aiAnalysis?: string;
}

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

