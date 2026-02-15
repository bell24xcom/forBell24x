const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// API routes for ACL
app.get('/api/acl', (req, res) => {
  console.log('GET /api/acl');
  // Sample data for ACLs
  const acls = [
    {
      id: 1,
      name: 'Admin Access',
      description: 'Full access to all system resources',
      created_by: 1,
      organization_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Read Only',
      description: 'Read-only access to system resources',
      created_by: 1,
      organization_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'RFQ Manager',
      description: 'Can create and manage RFQs',
      created_by: 1,
      organization_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  res.json(acls);
});

app.get('/api/organizations', (req, res) => {
  console.log('GET /api/organizations');
  // Sample data for organizations
  const organizations = [
    {
      id: 1,
      name: 'Tech Solutions Inc.',
      description: 'IT consulting and services',
      owner_id: 1,
      logo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Global Manufacturing Ltd.',
      description: 'Industrial equipment manufacturer',
      owner_id: 1,
      logo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  res.json(organizations);
});

app.get('/api/acl/check', (req, res) => {
  console.log('GET /api/acl/check', req.query);
  const { resourceType, resourceId } = req.query;
  
  // Sample permission check result
  const result = {
    permission: 'full',
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManage: true
  };
  
  res.json(result);
});

// Register video RFQ analytics API
app.use('/api/video-rfq-analytics', require('./api/video-rfq-analytics'));

// Register video RFQ upload API
app.use('/api/video-rfq', require('./api/video-rfq'));

// Register product showcases API
app.use('/api/product-showcases', require('./api/product-showcases'));

// Serve the main HTML file for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});