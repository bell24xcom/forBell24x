/**
 * Logistics Database Schema
 *
 * Provides database schema definitions for logistics tracking,
 * including shipments, shipment updates, and shipping documents.
 */

import { pgTable, serial, varchar, text, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';

/**
 * Logistics Provider enum type definition
 */
export const logisticsProviderEnum = pgEnum('logistics_provider', ['shiprocket', 'dhl', 'other']);

/**
 * Shipment Status enum type definition
 */
export const shipmentStatusEnum = pgEnum('shipment_status', [
  'pending',
  'processing',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'exception',
  'customs_hold',
]);

/**
 * Document Type enum type definition
 */
export const documentTypeEnum = pgEnum('document_type', [
  'invoice',
  'packing_list',
  'bill_of_lading',
  'customs_declaration',
  'certificate_of_origin',
  'dangerous_goods',
  'insurance',
]);

/**
 * Shipments table definition
 */
export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 100 }).notNull(),
  provider: logisticsProviderEnum('provider').notNull(),
  providerShipmentId: varchar('provider_shipment_id', { length: 100 }),
  senderDetails: json('sender_details').notNull(),
  receiverDetails: json('receiver_details').notNull(),
  packageDetails: json('package_details').notNull(),
  customsInfo: json('customs_info'),
  status: shipmentStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Shipment Updates table definition
 */
export const shipmentUpdates = pgTable('shipment_updates', {
  id: serial('id').primaryKey(),
  shipmentId: serial('shipment_id')
    .references(() => shipments.id, { onDelete: 'cascade' })
    .notNull(),
  status: shipmentStatusEnum('status').notNull(),
  location: json('location'),
  details: json('details').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Shipment Documents table definition
 */
export const shipmentDocuments = pgTable('shipment_documents', {
  id: serial('id').primaryKey(),
  shipmentId: serial('shipment_id')
    .references(() => shipments.id, { onDelete: 'cascade' })
    .notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  documentUrl: text('document_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Route Optimizations table definition
 */
export const routeOptimizations = pgTable('route_optimizations', {
  id: serial('id').primaryKey(),
  originCountry: varchar('origin_country', { length: 2 }).notNull(),
  originPostalCode: varchar('origin_postal_code', { length: 20 }).notNull(),
  destinationCountry: varchar('destination_country', { length: 2 }).notNull(),
  destinationPostalCode: varchar('destination_postal_code', { length: 20 }).notNull(),
  totalDistance: varchar('total_distance', { length: 50 }).notNull(),
  estimatedDuration: varchar('estimated_duration', { length: 50 }).notNull(),
  co2Emissions: varchar('co2_emissions', { length: 50 }),
  routeData: json('route_data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});
