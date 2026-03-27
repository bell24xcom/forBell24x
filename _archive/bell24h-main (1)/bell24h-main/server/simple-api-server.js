import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Mock categories data
const categories = [
  { id: 1, name: 'Electronics', description: 'Electronic devices and components' },
  { id: 2, name: 'Fashion', description: 'Clothing and accessories' },
  { id: 3, name: 'Technology', description: 'Software and IT services' },
  { id: 4, name: 'Manufacturing', description: 'Industrial manufacturing' },
  { id: 5, name: 'Healthcare', description: 'Medical and healthcare products' },
  { id: 6, name: 'Agriculture', description: 'Farming and agricultural supplies' },
  { id: 7, name: 'Construction', description: 'Building materials and equipment' },
  { id: 8, name: 'Automotive', description: 'Vehicle parts and services' }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Bell24H API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Categories API endpoint
app.get('/api/categories', (req, res) => {
  res.json({ 
    data: categories,
    message: 'Categories retrieved successfully'
  });
});

// Search API endpoint
app.post('/api/search', (req, res) => {
  const { query, category, location } = req.body;
  
  // Mock search results
  const results = [
    {
      id: 1,
      title: 'High-Quality Electronics Supplier',
      description: 'Premium electronic components and devices',
      category: category || 'Electronics',
      location: location || 'Mumbai',
      rating: 4.8,
      price: '₹50,000 - ₹2,00,000'
    },
    {
      id: 2,
      title: 'Fashion Wholesale Distributor',
      description: 'Bulk clothing and fashion accessories',
      category: category || 'Fashion',
      location: location || 'Delhi',
      rating: 4.6,
      price: '₹10,000 - ₹1,00,000'
    },
    {
      id: 3,
      title: 'IT Solutions Provider',
      description: 'Custom software development and IT services',
      category: category || 'Technology',
      location: location || 'Bangalore',
      rating: 4.9,
      price: '₹1,00,000 - ₹10,00,000'
    }
  ];
  
  res.json({
    data: results,
    query,
    category,
    location,
    total: results.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bell24H API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Categories: http://localhost:${PORT}/api/categories`);
  console.log(`🔍 Search: POST http://localhost:${PORT}/api/search`);
}); 