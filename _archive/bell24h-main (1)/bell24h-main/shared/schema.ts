// Stub for shared/schema.ts

import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const rfqs = pgTable('rfqs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  rfq_id: integer('rfq_id').notNull().references(() => rfqs.id),
  user_id: integer('user_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const productShowcases = pgTable('product_showcases', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}); 