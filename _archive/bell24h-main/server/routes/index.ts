import { Express } from 'express';
import express from 'express';
import { createServer } from 'http';
import teamsRouter from '../api/teams';
import delegationsRouter from '../api/delegations';
import productShowcasesRouter from '../api/product-showcases';
import testVideoComponentsRouter from '../api/test-video-components';
import videoMetricsApiRouter from '../api/video-metrics-api';
import perplexityApiRouter from '../api/perplexity-api';
import perplexityExplainRouter from '../api/perplexity-explain';
import perplexityAnalyticsRouter from '../api/perplexity-analytics';
import voiceRfqRouter from '../api/voice-rfq';
import financialRouter from '../controllers/financial';
import m1exchangeRouter from '../controllers/m1exchange-controller';
import supplierRiskExplainRouter from '../api/supplier-risk-explain';
import supplierRiskNeonRouter from '../api/supplier-risk-neon';
import healthCheckRouter from '../api/health-check';
import analyticsPredictiveRouter from '../api/analytics-predictive';
import walletRouter from '../api/wallet';
import walletDisburseRouter from '../api/wallet-disburse';
import adminUsersWalletsRouter from '../api/admin-users-wallets';
import azrRouter from './azr';
import categoryRoutes from './category.routes';
import marketRouter from './market';
import pricingRouter from './pricing';
import tradeRouter from './trade';
import logisticsRouter from './logistics';
import explainabilityRouter from './explainability';

import acl from './acl';
import analytics from './analytics';
import analyticsExport from './analytics-export';
import metrics from './metrics';
import organizations from './organizations';
import permissions from './permissions';
import teams from './teams';
import aiRouter from './ai';
import negotiationRouter from './negotiation';
import complianceRouter from './compliance';
import identityRouter from './identity';
import esgRouter from './esg';
import resilienceRouter from './resilience';
import personalizationRouter from './personalization';
import financeRouter from './finance';
import openapiRouter from './openapi';
import tradingRouter from './trading';
import explainabilityFeedbackRouter from './explainability-feedback';
import fileManagementRouter from './file-management';
import paymentVerificationRouter from './payment-verification';
import multiCurrencyRouter from './multi-currency';
import escrowRouter from './escrow';
import shippingRouter from './shipping';
import supplierVerificationRouter from './supplier-verification';
import buyerIntentRouter from './buyer-intent';
import mobileAppRouter from './mobile-app';
import smartContractRouter from './smart-contract';
import reportingRouter from './reporting';

import rfqRoutes from './rfq';

import analyticsRoutes from './analytics';

import imageRfqRoutes from './image-rfq';

/**
 * Register all API routes
 */
export function registerRoutesSync(app: Express) {
  // Synchronous registration of all API routes
  const API_PATH = '/api';
  app.use(`${API_PATH}/acl`, acl);
  app.use(`${API_PATH}/explain`, aiRouter);
  app.use(`${API_PATH}/negotiation`, negotiationRouter);
  app.use(`${API_PATH}/compliance`, complianceRouter);
  app.use(`${API_PATH}/identity`, identityRouter);
  app.use(`${API_PATH}/esg`, esgRouter);
  app.use(`${API_PATH}/resilience`, resilienceRouter);
  app.use(`${API_PATH}/personalization`, personalizationRouter);
  app.use(`${API_PATH}/finance`, financeRouter);
  app.use(`${API_PATH}/openapi`, openapiRouter);
  app.use(`${API_PATH}/trading`, tradingRouter);
  app.use(`${API_PATH}/files`, fileManagementRouter);
  app.use(`${API_PATH}/payment`, paymentVerificationRouter);
  app.use(`${API_PATH}/currency`, multiCurrencyRouter);
  app.use(`${API_PATH}/escrow`, escrowRouter);
  app.use(`${API_PATH}/shipping`, shippingRouter);
  app.use(`${API_PATH}/supplier`, supplierVerificationRouter);
  app.use(`${API_PATH}/buyer-intent`, buyerIntentRouter);
  app.use(`${API_PATH}/mobile`, mobileAppRouter);
  app.use(`${API_PATH}/smart-contract`, smartContractRouter);
  app.use(`${API_PATH}/report`, reportingRouter);
  app.use(`${API_PATH}/explainability-feedback`, explainabilityFeedbackRouter);
  // ...add any additional routes as needed
}

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Base API path
  const API_PATH = '/api';

  console.log('🚀 Starting route registration...');
  console.log('📍 API_PATH:', API_PATH);

  // Register legacy routes
  console.log('🔐 Registering ACL routes...');
  app.use(`${API_PATH}/acl`, acl);

  // Register AI explainability routes
  console.log('🤖 Registering AI explainability routes...');
  app.use(`${API_PATH}/explain`, aiRouter);

  // Register AZR (Absolute Zero Reasoner) routes
  console.log('🧠 Registering AZR routes...');
  app.use(`${API_PATH}/azr`, azrRouter);

  // Register Autonomous Negotiation Agent routes
  console.log('💬 Registering negotiation routes...');
  app.use(`${API_PATH}/negotiation`, negotiationRouter);

  // Register Compliance & Regulatory Intelligence
  console.log('📋 Registering compliance routes...');
  app.use(`${API_PATH}/compliance`, complianceRouter);

  // Register Decentralized Identity & Reputation
  console.log('🆔 Registering identity routes...');
  app.use(`${API_PATH}/identity`, identityRouter);

  // Register ESG Scoring
  console.log('🌱 Registering ESG routes...');
  app.use(`${API_PATH}/esg`, esgRouter);

  // Register Supply Chain Resilience
  console.log('🔄 Registering resilience routes...');
  app.use(`${API_PATH}/resilience`, resilienceRouter);

  // Register Hyper-Personalized Dashboards
  console.log('🎨 Registering personalization routes...');
  app.use(`${API_PATH}/personalization`, personalizationRouter);

  // Register Embedded Finance
  console.log('💰 Registering finance routes...');
  app.use(`${API_PATH}/finance`, financeRouter);

  // Register OpenAPI/Swagger documentation
  console.log('📚 Registering OpenAPI routes...');
  app.use(`${API_PATH}`, openapiRouter);

  // Register Trading features
  console.log('📈 Registering trading routes...');
  app.use(`${API_PATH}/trading`, tradingRouter);

  // Register Advanced File Management
  console.log('📁 Registering file management routes...');
  app.use(`${API_PATH}/files`, fileManagementRouter);

  // Register Payment Verification
  console.log('✅ Registering payment verification routes...');
  app.use(`${API_PATH}/payment`, paymentVerificationRouter);

  // Register Multi-Currency
  console.log('💱 Registering multi-currency routes...');
  app.use(`${API_PATH}/currency`, multiCurrencyRouter);

  // Register Escrow
  console.log('🔒 Registering escrow routes...');
  app.use(`${API_PATH}/escrow`, escrowRouter);

  // Register DHL/FedEx Integration
  console.log('📦 Registering shipping routes...');
  app.use(`${API_PATH}/shipping`, shippingRouter);

  // Register Shiprocket Logistics Integration
  console.log('🚚 Registering logistics routes...');
  app.use(`${API_PATH}/logistics`, logisticsRouter);

  // Register Supplier Verification
  console.log('🏢 Registering supplier verification routes...');
  app.use(`${API_PATH}/supplier`, supplierVerificationRouter);

  // Register Buyer Intent Engine
  console.log('🎯 Registering buyer intent routes...');
  app.use(`${API_PATH}/buyer-intent`, buyerIntentRouter);

  // Register Mobile App Flows
  console.log('📱 Registering mobile app routes...');
  app.use(`${API_PATH}/mobile`, mobileAppRouter);

  // Register Smart Contract Interaction
  console.log('📜 Registering smart contract routes...');
  app.use(`${API_PATH}/smart-contract`, smartContractRouter);

  // Register Automated Reporting
  console.log('📊 Registering reporting routes...');
  app.use(`${API_PATH}/report`, reportingRouter);
  app.use(`${API_PATH}/explainability-feedback`, explainabilityFeedbackRouter);
  app.use(`${API_PATH}/analytics`, analytics);
  app.use(`${API_PATH}/analytics-export`, analyticsExport);
  app.use(`${API_PATH}/metrics`, metrics);
  app.use(`${API_PATH}/organizations`, organizations);
  app.use(`${API_PATH}/permissions`, permissions);

  // Register Categories
  console.log('🗂️ Registering category routes...');
  app.use(`${API_PATH}/categories`, categoryRoutes);

  // Register new feature routes
  console.log('🆕 Registering NEW FEATURE routes...');
  console.log('📊 Registering market routes...');
  app.use(`${API_PATH}/market`, marketRouter);
  
  console.log('💰 Registering pricing routes...');
  app.use(`${API_PATH}/pricing`, pricingRouter);
  
  console.log('🌍 Registering trade routes...');
  app.use(`${API_PATH}/trade`, tradeRouter);
  
  console.log('📦 Registering logistics routes...');
  app.use(`${API_PATH}/logistics`, logisticsRouter);
  
  console.log('🤖 Registering explainability routes...');
  app.use(`${API_PATH}/explainability`, explainabilityRouter);

  // Legacy teams API - will be deprecated in favor of enhanced teams API
  console.log('👥 Registering legacy teams routes...');
  app.use(`${API_PATH}/legacy-teams`, teams);

  // Register enhanced user roles & permissions API routes
  app.use(`${API_PATH}/teams`, teamsRouter);
  app.use(`${API_PATH}/delegations`, delegationsRouter);

  // Register product showcases API routes
  app.use(`${API_PATH}/product-showcases`, productShowcasesRouter);

  // Test Video Components API routes (for testing without database)
  app.use(`${API_PATH}/tests`, testVideoComponentsRouter);

  // Video Metrics API routes for monitoring dashboards
  app.use(`${API_PATH}/video-metrics`, videoMetricsApiRouter);

  // Perplexity API routes for AI model explainability
  app.use(`${API_PATH}/perplexity`, perplexityApiRouter);

  // Perplexity Explanation API routes for AI model transparency
  app.use(`${API_PATH}/perplexity-explain`, perplexityExplainRouter);

  // Advanced Perplexity Analytics API routes for business insights
  app.use(`${API_PATH}/perplexity-analytics`, perplexityAnalyticsRouter);

  // Voice RFQ API routes for multilingual RFQ processing
  app.use(`${API_PATH}/voice-rfq`, voiceRfqRouter);

  // Financial services API routes for KredX and M1 Exchange integrations
  app.use(`${API_PATH}/financial`, financialRouter);

  // M1 Exchange API routes for early payment services
  app.use(`${API_PATH}/m1exchange`, m1exchangeRouter);

  // Supplier risk explainability API route
  app.use(`${API_PATH}/supplier-risk-explain`, supplierRiskExplainRouter);

  // Neon-powered supplier risk explainability API route
  app.use(`${API_PATH}/supplier-risk-neon`, supplierRiskNeonRouter);

  // Predictive analytics API route for logistics
  app.use(`${API_PATH}/analytics-predictive`, analyticsPredictiveRouter);

  // Wallet API route
  app.use(`${API_PATH}/wallet`, walletRouter);
  app.use(`${API_PATH}/wallet/disburse`, walletDisburseRouter);
  app.use(`${API_PATH}/admin/users-wallets`, adminUsersWalletsRouter);

  // Health check API route
  app.use(`${API_PATH}/health-check`, healthCheckRouter);

  // Image-based RFQ API route for Google Vision/OCR integration
  app.use(`${API_PATH}/image-rfq`, imageRfqRoutes);

  return server;
}
