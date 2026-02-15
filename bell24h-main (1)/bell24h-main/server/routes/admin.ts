import express from 'express';
const router = express.Router();

// Dummy data for demonstration; replace with real DB queries
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'supplier' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'buyer' },
];

const rfqs = [
  { id: 'rfq1', title: 'Need 100 widgets', status: 'open' },
  { id: 'rfq2', title: 'Request for 500 bolts', status: 'closed' },
];

router.get('/users', (req, res) => {
  res.json({ users });
});

router.get('/rfqs', (req, res) => {
  res.json({ rfqs });
});

export default router;
