# 🎯 BELL24h Marketing Plan - Company Profile Claiming & Supplier Onboarding

## 📊 Overview

This document outlines the complete marketing strategy for BELL24h, focusing on the **company profile claiming system** where users can claim their company profiles, suppliers login to manage their profiles, and showcase their products.

---

## 🎯 Marketing Strategy: Company Profile Claiming

### **Core Concept**
1. **Scrape Company Data** → Companies are scraped and listed as "UNCLAIMED"
2. **Invite Companies** → Marketing campaigns invite companies to claim their profiles
3. **Users Claim Profiles** → Company representatives claim and verify their profiles
4. **Supplier Login** → After claiming, suppliers can login and manage their company profile
5. **Company Profile Management** → Suppliers can edit profile, add products, showcase services
6. **Product Showcase** → Suppliers can showcase up to 12+ products on their profile

---

## 📁 Existing Files & Components

### ✅ **Already Created Files**

#### 1. **Database Schema** (`client/prisma/schema.prisma`)
- ✅ `ScrapedCompany` model with `claimStatus` field
- ✅ `CompanyClaim` model for claim requests
- ✅ `ClaimStatus` enum: `UNCLAIMED`, `CLAIMED`, `PENDING`
- ✅ Verification methods: Email, Phone, Documents
- ✅ Benefits tracking for claimed companies

#### 2. **API Routes** (`client/src/app/api/suppliers/route.ts`)
- ✅ GET `/api/suppliers` - Returns unclaimed companies
- ✅ Filters by `claimStatus: 'UNCLAIMED'`
- ✅ Returns company data: name, email, phone, city, state, category

#### 3. **Supplier Profile Components** (`src.backup/components/suppliers/`)
- ✅ `SupplierProfileView.tsx` - Full supplier profile page
  - Company logo and info
  - Contact information
  - Business description
  - Product showcase section
  - Claim profile button
  - Edit profile (for owners)
  - SEO content section
  
- ✅ `ProductShowcaseGrid.tsx` - Product display grid
  - 12 product slots (grid layout)
  - Product images, names, descriptions
  - Price range, MOQ, units
  - Featured products
  - Add/edit products (for owners)
  - Placeholder slots for adding products

#### 4. **Marketing Plan** (`BELL24H_MARKETING_CAMPAIGN_LAUNCH.md`)
- ✅ Target: 50,000 suppliers in 369 days
- ✅ Revenue goal: ₹156 crore
- ✅ Marketing channels: Google Ads, LinkedIn, Social Media, TV, Radio
- ✅ Campaign phases: Soft Launch → Public Launch → Scale Up → Mass Market

#### 5. **Suppliers Page** (`client/src/app/suppliers/page.tsx`)
- ✅ Basic suppliers listing page
- ⚠️ Needs to be enhanced with claim functionality

---

## 🚀 Implementation Plan

### **Phase 1: Company Profile Claiming System**

#### 1.1 Create Claim API Endpoints

**File**: `client/src/app/api/claim/company/route.ts`
```typescript
// POST /api/claim/company
// - Accepts: companyId, claimedBy (email), claimedByName, claimedByPhone, claimedByRole
// - Creates CompanyClaim record
// - Sends verification email/SMS
// - Updates ScrapedCompany.claimStatus to PENDING
```

**File**: `client/src/app/api/claim/verify/route.ts`
```typescript
// POST /api/claim/verify
// - Accepts: claimId, verificationCode
// - Verifies email/phone
// - Updates CompanyClaim.status to CLAIMED
// - Updates ScrapedCompany.claimStatus to CLAIMED
// - Creates user account for supplier
// - Sends welcome email/SMS
```

#### 1.2 Create Claim Profile Modal Component

**File**: `client/src/components/suppliers/ClaimProfileModal.tsx`
- Form to claim company profile
- Fields: Name, Email, Phone, Role, Verification Method
- Submit claim request
- Show verification status

#### 1.3 Create Supplier Profile Page

**File**: `client/src/app/suppliers/[slug]/page.tsx`
- Display supplier profile using `SupplierProfileView`
- Show "Claim This Profile" button if unclaimed
- Show "Edit Profile" button if user owns the profile
- Display products using `ProductShowcaseGrid`

#### 1.4 Create Supplier Dashboard

**File**: `client/src/app/supplier/dashboard/page.tsx`
- Dashboard for suppliers to manage their profile
- Edit company information
- Add/edit products
- View analytics
- Manage orders/RFQs

---

### **Phase 2: Supplier Login & Profile Management**

#### 2.1 Supplier Authentication
- ✅ Already have OTP login (`/auth/login-otp`)
- Link supplier account to claimed company
- Session management for suppliers

#### 2.2 Company Profile Management
- Edit company information (name, description, logo, contact info)
- Upload company documents
- Manage business details (GST, turnover, employees)
- Update categories and subcategories

#### 2.3 Product Showcase Management
- Add products (name, description, images, price, MOQ)
- Edit products
- Delete products
- Set featured products
- Upload product images

---

### **Phase 3: Marketing Automation with n8n**

#### 3.1 Invite Companies to Claim Profiles

**n8n Workflow**: "Invite Companies to Claim Profiles"
1. **Trigger**: Scheduled (daily) or Manual
2. **Action**: Query unclaimed companies from database
3. **Filter**: Companies with high trust score, verified contact info
4. **Send Invitation**: 
   - Email via SMTP
   - SMS via MSG91
   - WhatsApp (optional)
5. **Track Responses**: Log in MarketingResponse table
6. **Follow-up**: Send reminders after 7 days if no claim

#### 3.2 Welcome New Suppliers

**n8n Workflow**: "Welcome New Suppliers" (Already created)
1. **Trigger**: Webhook when company is claimed
2. **Action**: Send welcome SMS via MSG91
3. **Wait**: 24 hours
4. **Check**: If supplier verified profile
5. **Action**: Add to Active Suppliers or send reminder

#### 3.3 Claim Verification Workflow

**n8n Workflow**: "Claim Verification"
1. **Trigger**: Webhook when claim is submitted
2. **Action**: Send verification code via SMS/Email
3. **Wait**: User verifies
4. **Action**: Approve claim, create supplier account
5. **Action**: Send welcome package (benefits, instructions)

---

## 📋 Database Schema (Already Exists)

### **ScrapedCompany Model**
```prisma
model ScrapedCompany {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String?
  city          String?
  state         String?
  category      String?
  claimStatus   ClaimStatus @default(UNCLAIMED)
  claimedAt     DateTime?
  claimId       String?  @unique
  claim         CompanyClaim?
  // ... other fields
}
```

### **CompanyClaim Model**
```prisma
model CompanyClaim {
  id                String   @id @default(cuid())
  scrapedCompanyId  String   @unique
  scrapedCompany    ScrapedCompany @relation(...)
  claimedBy         String   // Email
  claimedByName     String
  claimedByPhone    String
  claimedByRole     String
  verificationMethod VerificationMethod
  verificationCode  String?
  isEmailVerified   Boolean  @default(false)
  isPhoneVerified   Boolean  @default(false)
  status            ClaimStatus @default(PENDING)
  benefits          Json
  claimedAt         DateTime @default(now())
  // ... other fields
}
```

### **ClaimStatus Enum**
```prisma
enum ClaimStatus {
  UNCLAIMED
  CLAIMED
  PENDING
}
```

---

## 🎯 User Flow

### **Flow 1: Company Claims Profile**

1. **User visits** `/suppliers/[slug]` → Sees company profile
2. **Clicks** "Claim This Profile" button
3. **Fills form** in `ClaimProfileModal`:
   - Name, Email, Phone, Role
   - Verification method (Email/Phone)
4. **Submits claim** → POST `/api/claim/company`
5. **Receives verification code** via SMS/Email
6. **Verifies code** → POST `/api/claim/verify`
7. **Profile claimed** → Status changes to CLAIMED
8. **User account created** → Supplier can login
9. **Welcome email/SMS** sent via n8n workflow

### **Flow 2: Supplier Login & Manage Profile**

1. **Supplier logs in** → `/auth/login-otp` (mobile OTP)
2. **Redirected to** → `/supplier/dashboard`
3. **Views company profile** → Can see current profile data
4. **Edits profile** → Updates company information
5. **Adds products** → Uploads product images, details
6. **Manages showcase** → Sets featured products, organizes grid
7. **Views analytics** → Sees profile views, inquiries, RFQs

### **Flow 3: Marketing Invitation**

1. **Marketing team** triggers n8n workflow
2. **Workflow queries** unclaimed companies from database
3. **Sends invitations** via Email/SMS to company contacts
4. **Tracks responses** in MarketingResponse table
5. **Follows up** with reminders if no claim after 7 days
6. **Monitors conversion** rate (claims / invitations sent)

---

## 📊 Marketing Metrics

### **Claim Conversion Metrics**
- **Invitations Sent**: Number of companies invited to claim
- **Claims Submitted**: Number of claim requests received
- **Claims Verified**: Number of successfully verified claims
- **Conversion Rate**: (Claims Verified / Invitations Sent) × 100
- **Time to Claim**: Average time from invitation to claim
- **Verification Rate**: (Verified Claims / Submitted Claims) × 100

### **Supplier Engagement Metrics**
- **Active Suppliers**: Suppliers who logged in within 30 days
- **Profile Completions**: Suppliers who completed their profile
- **Product Uploads**: Average number of products per supplier
- **Profile Views**: Number of times supplier profile was viewed
- **Inquiries Received**: Number of RFQs/inquiries per supplier

---

## 🚀 Implementation Checklist

### **Backend/API**
- [ ] Create `/api/claim/company` endpoint
- [ ] Create `/api/claim/verify` endpoint
- [ ] Create `/api/suppliers/[id]` endpoint (get supplier by ID)
- [ ] Create `/api/supplier/profile` endpoint (update profile)
- [ ] Create `/api/supplier/products` endpoint (manage products)
- [ ] Integrate with MSG91 for verification SMS
- [ ] Integrate with email service for verification emails

### **Frontend/Components**
- [ ] Create `ClaimProfileModal` component
- [ ] Create `SupplierProfileView` component (move from backup)
- [ ] Create `ProductShowcaseGrid` component (move from backup)
- [ ] Create `/suppliers/[slug]/page.tsx` (supplier profile page)
- [ ] Create `/supplier/dashboard/page.tsx` (supplier dashboard)
- [ ] Create `/supplier/profile/edit/page.tsx` (edit profile)
- [ ] Create `/supplier/products/manage/page.tsx` (manage products)
- [ ] Update `/suppliers/page.tsx` (enhanced suppliers listing)

### **n8n Workflows**
- [ ] Create "Invite Companies to Claim Profiles" workflow
- [ ] Update "Welcome New Suppliers" workflow (already created)
- [ ] Create "Claim Verification" workflow
- [ ] Create "Claim Reminder" workflow (follow-up after 7 days)
- [ ] Create "Supplier Onboarding" workflow (guide new suppliers)

### **Database**
- [ ] Verify `ScrapedCompany` table exists
- [ ] Verify `CompanyClaim` table exists
- [ ] Verify `MarketingResponse` table exists
- [ ] Seed sample unclaimed companies for testing
- [ ] Create indexes on `claimStatus`, `claimedAt` fields

### **Testing**
- [ ] Test claim flow end-to-end
- [ ] Test verification flow (SMS/Email)
- [ ] Test supplier login and profile management
- [ ] Test product showcase functionality
- [ ] Test n8n workflows with real data
- [ ] Test marketing invitation workflow

---

## 📝 Next Steps

1. **Move components from backup** to active directory
2. **Create API endpoints** for claim functionality
3. **Create supplier dashboard** pages
4. **Set up n8n workflows** for marketing automation
5. **Test end-to-end flow** with sample data
6. **Launch marketing campaign** to invite companies
7. **Monitor metrics** and optimize conversion rates

---

## 🔗 Related Files

- **Marketing Plan**: `BELL24H_MARKETING_CAMPAIGN_LAUNCH.md`
- **Database Schema**: `client/prisma/schema.prisma`
- **Supplier API**: `client/src/app/api/suppliers/route.ts`
- **Supplier Profile**: `src.backup/components/suppliers/SupplierProfileView.tsx`
- **Product Showcase**: `src.backup/components/suppliers/ProductShowcaseGrid.tsx`
- **n8n Workflows**: `backend/n8n/workflows/marketing-automation.json`

---

## 🎉 Status

**Ready for Implementation!**

All necessary database schema, components, and workflows are either created or identified. The system is ready to implement the company profile claiming feature with full marketing automation.

---

**Last Updated**: November 9, 2025
**Status**: ✅ Ready for Implementation

