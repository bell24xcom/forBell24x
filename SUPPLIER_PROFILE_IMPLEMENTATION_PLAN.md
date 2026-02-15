# 🏢 BELL24h Supplier Profile & Company Claiming - Implementation Plan

## 📋 Summary

This document provides a detailed implementation plan for the **Company Profile Claiming System** and **Supplier Profile Management** features in BELL24h.

---

## ✅ What's Already Built

### 1. **Database Schema** ✅
- `ScrapedCompany` model with `claimStatus` field
- `CompanyClaim` model for claim requests
- `ClaimStatus` enum: `UNCLAIMED`, `CLAIMED`, `PENDING`
- Verification methods and benefits tracking

### 2. **Components** ✅ (In Backup)
- `SupplierProfileView.tsx` - Full supplier profile page
- `ProductShowcaseGrid.tsx` - Product display grid (12 products)

### 3. **API Routes** ✅
- `GET /api/suppliers` - Returns unclaimed companies

### 4. **Marketing Plan** ✅
- `BELL24H_MARKETING_CAMPAIGN_LAUNCH.md` - Complete marketing strategy

### 5. **n8n Workflows** ✅
- `marketing-automation.json` - Welcome new suppliers workflow

---

## 🚀 Implementation Steps

### **Step 1: Move Components from Backup** (5 minutes)

```bash
# Copy components from backup to active directory
cp src.backup/components/suppliers/SupplierProfileView.tsx client/src/components/suppliers/
cp src.backup/components/suppliers/ProductShowcaseGrid.tsx client/src/components/suppliers/
```

### **Step 2: Create Claim API Endpoints** (30 minutes)

#### 2.1 Create Claim Company Endpoint

**File**: `client/src/app/api/claim/company/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTP } from '@/lib/msg91'; // Your MSG91 service

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, claimedBy, claimedByName, claimedByPhone, claimedByRole, verificationMethod } = body;

    // Check if company exists and is unclaimed
    const company = await prisma.scrapedCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company.claimStatus !== 'UNCLAIMED') {
      return NextResponse.json({ error: 'Company already claimed' }, { status: 400 });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create claim request
    const claim = await prisma.companyClaim.create({
      data: {
        scrapedCompanyId: companyId,
        claimedBy,
        claimedByName,
        claimedByPhone,
        claimedByRole,
        verificationMethod,
        verificationCode,
        status: 'PENDING',
        benefits: {
          freeListing: true,
          featuredBadge: true,
          prioritySupport: true,
          value: 30000,
        },
      },
    });

    // Send verification code via SMS/Email
    if (verificationMethod === 'PHONE') {
      await sendOTP(claimedByPhone, verificationCode);
    } else {
      // Send email verification
      // await sendEmailVerification(claimedBy, verificationCode);
    }

    // Update company claim status
    await prisma.scrapedCompany.update({
      where: { id: companyId },
      data: {
        claimStatus: 'PENDING',
        claimId: claim.id,
      },
    });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: 'Verification code sent',
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
  }
}
```

#### 2.2 Create Verify Claim Endpoint

**File**: `client/src/app/api/claim/verify/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, verificationCode } = body;

    // Find claim
    const claim = await prisma.companyClaim.findUnique({
      where: { id: claimId },
      include: { scrapedCompany: true },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Verify code
    if (claim.verificationCode !== verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Update claim status
    const updatedClaim = await prisma.companyClaim.update({
      where: { id: claimId },
      data: {
        status: 'CLAIMED',
        isEmailVerified: true,
        isPhoneVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Update company claim status
    await prisma.scrapedCompany.update({
      where: { id: claim.scrapedCompanyId },
      data: {
        claimStatus: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    // TODO: Create user account for supplier
    // TODO: Send welcome email/SMS
    // TODO: Trigger n8n workflow for welcome

    return NextResponse.json({
      success: true,
      message: 'Profile claimed successfully',
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Failed to verify claim' }, { status: 500 });
  }
}
```

### **Step 3: Create Supplier Profile Page** (20 minutes)

**File**: `client/src/app/suppliers/[slug]/page.tsx`
```typescript
import { notFound } from 'next/navigation';
import SupplierProfileView from '@/components/suppliers/SupplierProfileView';
import { prisma } from '@/lib/prisma';

export default async function SupplierProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supplier = await prisma.scrapedCompany.findUnique({
    where: { id: params.slug },
    include: {
      claim: true,
    },
  });

  if (!supplier) {
    notFound();
  }

  const isClaimable = supplier.claimStatus === 'UNCLAIMED';

  return (
    <SupplierProfileView
      supplier={supplier}
      isClaimable={isClaimable}
    />
  );
}
```

### **Step 4: Create Claim Profile Modal** (30 minutes)

**File**: `client/src/components/suppliers/ClaimProfileModal.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClaimProfileModalProps {
  supplier: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimProfileModal({
  supplier,
  isOpen,
  onClose,
}: ClaimProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    verificationMethod: 'PHONE',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/claim/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: supplier.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
      }
    } catch (error) {
      console.error('Claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: '', // Get from previous response
          verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onClose();
        // Redirect to supplier dashboard
        window.location.href = '/supplier/dashboard';
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Claim This Profile</h2>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              placeholder="Your Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
            <select
              value={formData.verificationMethod}
              onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="PHONE">Phone (SMS)</option>
              <option value="EMAIL">Email</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p>Enter the verification code sent to your {formData.verificationMethod === 'PHONE' ? 'phone' : 'email'}</p>
            <Input
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep('form')}>
                Back
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

### **Step 5: Create Supplier Dashboard** (45 minutes)

**File**: `client/src/app/supplier/dashboard/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Fetch company data for logged-in supplier
    // TODO: Implement API call
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Supplier Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/supplier/profile/edit" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Edit Profile</h2>
          <p className="text-gray-600">Update your company information</p>
        </Link>
        
        <Link href="/supplier/products/manage" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Products</h2>
          <p className="text-gray-600">Add and edit your products</p>
        </Link>
        
        <Link href="/supplier/analytics" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">View your profile performance</p>
        </Link>
      </div>
    </div>
  );
}
```

### **Step 6: Update n8n Workflows** (30 minutes)

#### 6.1 Create "Invite Companies to Claim" Workflow

**File**: `backend/n8n/workflows/invite-companies-claim.json`
- Trigger: Scheduled (daily) or Manual
- Query unclaimed companies from database
- Send invitation emails/SMS
- Track responses in MarketingResponse table
- Follow-up after 7 days if no claim

#### 6.2 Update "Welcome New Suppliers" Workflow

**File**: `backend/n8n/workflows/marketing-automation.json` (already created)
- Trigger: Webhook when company is claimed
- Send welcome SMS via MSG91
- Wait 24 hours
- Check if supplier verified profile
- Add to Active Suppliers or send reminder

---

## 📊 Testing Checklist

- [ ] Test claim flow end-to-end
- [ ] Test verification SMS/Email
- [ ] Test supplier login after claim
- [ ] Test profile editing
- [ ] Test product showcase
- [ ] Test n8n workflows
- [ ] Test marketing invitation workflow

---

## 🎯 Success Metrics

- **Claim Conversion Rate**: Target 10-15% (claims / invitations)
- **Verification Rate**: Target 80%+ (verified / submitted)
- **Profile Completion Rate**: Target 70%+ (completed profiles / claimed)
- **Product Upload Rate**: Target 5+ products per supplier

---

## 🔗 Related Files

- **Marketing Plan**: `MARKETING_PLAN_COMPANY_PROFILE_CLAIMING.md`
- **Database Schema**: `client/prisma/schema.prisma`
- **Supplier API**: `client/src/app/api/suppliers/route.ts`
- **n8n Workflows**: `backend/n8n/workflows/`

---

**Status**: ✅ Ready for Implementation
**Estimated Time**: 3-4 hours
**Priority**: High

