import express from 'express';
import { generateCSVReport, generatePDFReport } from '../services/reporting';

const router = express.Router();

// POST /api/report/csv
router.post('/csv', async (req, res) => {
  try {
    const { data, fields, filePath } = req.body;
    const result = await generateCSVReport(data, fields, filePath);
    res.json({ filePath: result });
  } catch (error: any) {
    res.status(500).json({ error: 'CSV report generation failed', details: error.message });
  }
});

// POST /api/report/pdf
router.post('/pdf', async (req, res) => {
  try {
    const { data, filePath } = req.body;
    const result = await generatePDFReport(data, filePath);
    res.json({ filePath: result });
  } catch (error: any) {
    res.status(500).json({ error: 'PDF report generation failed', details: error.message });
  }
});

export default router;
