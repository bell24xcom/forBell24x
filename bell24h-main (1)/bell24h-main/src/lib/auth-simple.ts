/**
 * SIMPLIFIED Authentication System
 * Mobile OTP based authentication without NextAuth
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Initialize Prisma
const prisma = new PrismaClient()

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token for mobile OTP authentication
export function generateJWTToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
}

// Verify JWT token
export function verifyJWTToken(token: string): { userId: string; valid: boolean } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp, random] = decoded.split(':');
    
    // Check if token is not too old (30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (tokenAge > maxAge) {
      return { userId: '', valid: false };
    }
    
    return { userId, valid: true };
  } catch (error) {
    return { userId: '', valid: false };
  }
}