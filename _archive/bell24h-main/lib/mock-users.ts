// lib/mock-users.ts - Shared user storage for all auth endpoints
// In production, this would be replaced with a real database

export interface User {
  id: string;
  phone: string;
  email?: string;
  isNewUser: boolean;
  kycCompleted: boolean;
  planSelected: boolean;
  plan?: string;
  planStartDate?: string;
  planStatus?: 'active' | 'trial' | 'inactive';
  isTrial?: boolean;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  kycData?: any;
  createdAt: string;
  updatedAt: string;
}

// Shared user storage
export const users: User[] = [];

// Helper function to find or create user
export function findOrCreateUser(userId: string, phone?: string, email?: string): number {
  let userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1 && phone) {
    // Create new user if not found but phone provided
    const newUser: User = {
      id: userId,
      phone: phone,
      email: email,
      isNewUser: true,
      kycCompleted: false,
      planSelected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    userIndex = users.length - 1;
  }
  
  return userIndex;
}

// Helper function to find user by ID
export function findUserById(userId: string): number {
  return users.findIndex(u => u.id === userId);
}

// Helper function to update user
export function updateUser(userIndex: number, updates: Partial<User>): User {
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return users[userIndex];
}
