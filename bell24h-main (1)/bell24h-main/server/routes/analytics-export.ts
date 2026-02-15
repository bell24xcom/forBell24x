import { Router } from 'express';
import { initAnalyticsExportRoutes } from '../api/analytics-export';

const router = Router();

// Initialize the analytics export routes
initAnalyticsExportRoutes(router);

export default router;
