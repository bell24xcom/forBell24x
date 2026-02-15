/**
 * Database Schema Index
 *
 * Exports all database schema definitions for use in the application.
 */

// Export logistics schema
export * from './logistics';

// Re-export for convenience
export {
  shipments,
  shipmentUpdates,
  shipmentDocuments,
  routeOptimizations,
  logisticsProviderEnum,
  shipmentStatusEnum,
  documentTypeEnum,
} from './logistics';
