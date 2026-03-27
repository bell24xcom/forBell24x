import express from 'express';
import { generateReport } from '../services/reportGeneratorService.js';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

interface ReportTemplate {
  title: string;
  headers: string[];
  format: (data: any) => any;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware to authenticate all report routes
router.use(authenticateToken);

// POST /api/reports/generate - Generate a report
router.post('/generate', async (req, res) => {
  try {
    const { type, template, data, fileName } = req.body;
    
    // Validate required fields
    if (!type || !template || !data || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Generate report
    const filePath = await generateReport({
      type,
      template,
      data,
      fileName
    });
    
    // Send file
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending report:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to send report'
        });
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate report'
    });
  }
});

const reportTemplates: Record<string, ReportTemplate> = {
  'rfq-summary': {
    title: 'RFQ Summary Report',
    headers: ['RFQ ID', 'Product', 'Quantity', 'Status', 'Created At', 'Supplier Count'],
    format: (data: any) => ({
      rfqId: data.id,
      product: data.product.name,
      quantity: data.quantity,
      status: data.status,
      createdAt: new Date(data.createdAt).toLocaleString(),
      supplierCount: data.suppliers.length
    })
  },
  'supplier-performance': {
    title: 'Supplier Performance Report',
    headers: ['Supplier Name', 'RFQ Response Rate', 'Quote Acceptance Rate', 'Delivery Performance', 'Rating'],
    format: (data: any) => ({
      supplierName: data.name,
      rfqResponseRate: `${Math.round(data.rfqResponseRate * 100)}%`,
      quoteAcceptanceRate: `${Math.round(data.quoteAcceptanceRate * 100)}%`,
      deliveryPerformance: `${data.deliveryPerformance}%`,
      rating: data.rating.toFixed(1)
    })
  },
  'trend-analysis': {
    title: 'Market Trend Analysis Report',
    headers: ['Category', 'Growth Rate', 'Volume', 'Price Trend', 'Seasonality'],
    format: (data: any) => ({
      category: data.category,
      growthRate: `${data.growthRate}%`,
      volume: data.volume.toLocaleString(),
      priceTrend: data.priceTrend,
      seasonality: data.seasonality
    })
  }
};

// GET /api/reports/templates - Get available report templates
router.get('/templates', (req, res) => {
  try {
    const templateList = Object.keys(reportTemplates).map(template => ({
      id: template,
      title: reportTemplates[template].title,
      headers: reportTemplates[template].headers
    }));
    
    res.json({
      success: true,
      data: templateList
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
});

// GET /api/reports/types - Get available report types
router.get('/types', (req, res) => {
  try {
    const types = ['pdf', 'excel'];
    res.json({
      success: true,
      types
    });
  } catch (error) {
    console.error('Error fetching report types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report types'
    });
  }
});

export default router;
