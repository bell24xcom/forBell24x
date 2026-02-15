// RFQ Types
export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface InsertRFQ {
  title: string;
  description: string;
  category: string;
  budget: number;
  userId: string;
}

// Bid Types
export interface Bid {
  id: string;
  rfqId: string;
  supplierId: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertBid {
  rfqId: string;
  supplierId: string;
  amount: number;
  description: string;
}

// Contract Types
export interface Contract {
  id: string;
  rfqId: string;
  supplierId: string;
  buyerId: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertContract {
  rfqId: string;
  supplierId: string;
  buyerId: string;
  amount: number;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertMessage {
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Access Control Types
export interface AccessControlList {
  id: string;
  resource: string;
  action: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertTransaction {
  walletId: string;
  type: string;
  amount: number;
  currency: string;
}

// Schema validation functions
export const insertAccessControlListSchema = {
  resource: (value: string) => typeof value === 'string' && value.length > 0,
  action: (value: string) => typeof value === 'string' && value.length > 0,
  role: (value: string) => typeof value === 'string' && value.length > 0,
};

export const insertOrganizationSchema = {
  name: (value: string) => typeof value === 'string' && value.length > 0,
  type: (value: string) => typeof value === 'string' && value.length > 0,
};
