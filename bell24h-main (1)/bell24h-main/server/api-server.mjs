import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 1, name: 'Electronics', description: 'Electronic devices and components' },
    { id: 2, name: 'Fashion', description: 'Clothing and accessories' },
    { id: 3, name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    { id: 4, name: 'Industrial', description: 'Industrial equipment and supplies' },
    { id: 5, name: 'Healthcare', description: 'Medical devices and supplies' }
  ];
  
  console.log('Categories API called - returning', categories.length, 'categories');
  res.json(categories);
});

app.listen(PORT, () => {
  console.log(' Bell24h API Server running on http://localhost:' + PORT);
  console.log(' Categories API: http://localhost:' + PORT + '/api/categories');
  console.log('  Health Check: http://localhost:' + PORT + '/health');
});
