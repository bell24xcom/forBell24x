import { z } from 'zod';

/**
 * RFQ Creation Input Schema
 */
export const RfqCreateSchema = z.object({
  title: z.string().min(5).max(100).trim().transform(s => s.replace(/<[^>]*>?/gm, '')), // Basic HTML strip
  category: z.string().min(2).max(50).trim(),
  quantity: z.string().min(1).max(20).trim(),
  budget: z.string().optional(),
  location: z.string().min(2).max(100).trim().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  description: z.string().min(10).max(2000).trim().transform(s => s.replace(/<[^>]*>?/gm, '')),
});

/**
 * Authentication Input Schema
 */
export const AuthSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  otp: z.string().length(6).optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
});

/**
 * Marketing Rule Schema
 */
export const CampaignRuleSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  action_type: z.enum(['whatsapp', 'email', 'webhook']),
  template_text: z.string().min(5).max(5000),
});
