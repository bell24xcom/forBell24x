'use client';

/**
 * GuestRFQManager
 * Handles the "Try Without Login" flow by persisting RFQ data in LocalStorage
 * and managing the transition to a full account.
 */

import { storeRFQ, extractRFQMeta as extractMemoryMeta } from '@/lib/memory-engine';

export interface GuestRFQ {
  id: string;
  type: 'video' | 'voice' | 'text';
  category: string;
  city: string;
  data: any;
  timestamp: string;
  isConverted: boolean;
}

/**
 * Utility to extract metadata from Video/Voice/Text RFQ inputs
 */
export const extractRFQMeta = (rfq: Partial<GuestRFQ>): any => {
  // Detection logic for guest intent
  const category = rfq.category || 'General';
  const city = rfq.city || 'Unknown';
  
  // Base metadata extraction
  const meta = {
    rfqId: rfq.id || 'guest_temp',
    title: `${category} Requirement in ${city}`,
    category: category,
    location: city,
    metadata: {
      source: 'guest',
      isTemporary: true,
      type: rfq.type,
      ...rfq.data?.metadata
    }
  };

  return extractMemoryMeta(meta as any);
};

const STORAGE_KEY = 'bell24h_guest_rfqs';

export const GuestRFQManager = {
  /**
   * Saves a new RFQ to local storage for guest users and syncs with Elephant Memory
   */
  saveGuestRFQ: (rfqData: Omit<GuestRFQ, 'id' | 'timestamp' | 'isConverted'>): GuestRFQ => {
    const rfqs = GuestRFQManager.getGuestRFQs();
    
    const id = `guest_${Math.random().toString(36).substr(2, 9)}`;
    const newRFQ: GuestRFQ = {
      ...rfqData,
      id,
      timestamp: new Date().toISOString(),
      isConverted: false
    };
    
    rfqs.push(newRFQ);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rfqs));

    // SYNC WITH ELEPHANT MEMORY (Layer 1: Episodic)
    // We use a try-catch because memory-engine might be server-side only in some contexts
    try {
      const memoryMeta = extractRFQMeta(newRFQ);
      // We wrap this in an async trigger or fire-and-forget
      fetch('/api/rfq/guest-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryMeta)
      }).catch(err => console.error('Memory sync failed:', err));
    } catch (e) {
      console.warn('Elephant Memory sync skipped (client-side):', e);
    }

    return newRFQ;
  },

  /**
   * Retrieves all guest RFQs from local storage
   */
  getGuestRFQs: (): GuestRFQ[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  /**
   * Checks if the current user has any active guest RFQs
   */
  hasGuestRFQs: (): boolean => {
    return GuestRFQManager.getGuestRFQs().length > 0;
  },

  /**
   * Clears all guest data (called after successful account conversion)
   */
  clearGuestData: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Mark an RFQ as converted to a real database entry
   */
  markAsConverted: (id: string) => {
    const rfqs = GuestRFQManager.getGuestRFQs();
    const index = rfqs.findIndex(r => r.id === id);
    if (index !== -1) {
      rfqs[index].isConverted = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rfqs));
    }
  }
};
