# Bell24h Project - RFQ Save Flow Investigation

## Database Architecture
- **ORM**: Prisma + PostgreSQL (Neon)
- **Location**: `/c/Users/Sanika/Projects/bell24h/prisma/schema.prisma`
- **Primary Database**: Neon PostgreSQL (not Supabase)

## RFQ Save Flow

### 1. Frontend Component: `/app/voice-rfq/page.tsx`
- **Lines 225-255**: `saveRFQ()` function
- **Endpoint**: POST to `/api/voice-rfq/save`
- **Data Structure** (VoiceRFQData interface, lines 6-18):
  - `id`: string
  - `title`: string
  - `description`: string
  - `category`: string
  - `quantity`: string (e.g., "100 units")
  - `specifications`: string[] (array)
  - `timeline`: string
  - `budget`: string (e.g., "₹50,000 - ₹75,000")
  - `status`: 'draft' | 'active' | 'quoted' | 'completed'
  - `createdAt`: string
  - `createdVia`: 'voice' | 'manual'

### 2. API Route: `/app/api/voice-rfq/save/route.ts`
- **Authentication**: JWT token from cookie or Bearer header
- **User Validation**: Uses `verifyToken()` from `/lib/jwt.ts`
- **Save Logic** (lines 47-62):
  - Parses `quantity` from string to number
  - Parses `budget` from string to `minBudget`/`maxBudget` floats
  - Creates RFQ using Prisma client

### 3. Database Schema: `prisma/schema.prisma` (lines 84-117)
**RFQ Model Fields**:
- `id`: String (cuid)
- `title`: String ✓
- `description`: String? ✓
- `category`: String ✓
- `quantity`: String ✓ (stored as string in DB)
- `unit`: String (default "units")
- `status`: RFQStatus (enum)
- `timeline`: String? ✓
- `minBudget`: Float? ✓
- `maxBudget`: Float? ✓
- `requirements`: String? (NOT USED by save API)
- `urgency`: RFQUrgency (enum)
- `createdBy`: String? (userId)
- `expiresAt`: DateTime?
- Other fields: categoryId, location, tags, etc.

## Critical Issues Found

### Issue 1: Missing `specifications` Column
**Problem**:
- Frontend sends `specifications: string[]` (line 167-169 in page.tsx)
- Prisma schema has NO `specifications` field
- Save API route does NOT handle specifications at all
- Data is lost during save

**Impact**: User's specifications from voice input are silently dropped

### Issue 2: Field Mapping Mismatches
**Frontend → API → Database**:
- `quantity`: string → parsed to int → saved as STRING in DB (inconsistent)
- `budget`: string → parsed to minBudget/maxBudget floats → saved ✓
- `timeline`: string → string ✓
- `status`: frontend uses lowercase 'draft'/'active' → API uses 'OPEN' enum
- `specifications`: array → NOT SAVED (missing field)

### Issue 3: Requirements vs Specifications
- Schema has `requirements: String?` field
- Frontend uses `specifications: string[]`
- These are likely the same data but named differently
- Save API ignores both

### Issue 4: Status Enum Mismatch
Frontend VoiceRFQData status:
```typescript
status: 'draft' | 'active' | 'quoted' | 'completed'
```

Prisma RFQStatus enum (lines 297-309):
```
OPEN | CLOSED | CANCELLED | COMPLETED | DRAFT | ACTIVE | QUOTED | ACCEPTED | IN_PROGRESS | EXPIRED | CLOSED_EXTERNAL
```

API hardcodes `status: 'OPEN'` (line 58) regardless of frontend value.

## category_stats View
**Status**: NOT FOUND
- No SQL view definition exists
- No Prisma view/model for aggregated stats
- Frontend likely needs this for dashboard analytics

## Recommended Fixes

### Priority 1: Add specifications/requirements handling
1. Decide: use `requirements` field or add `specifications` column
2. Update save API to handle the array (join to string or store as JSON)

### Priority 2: Fix quantity type inconsistency
- DB stores as String but API parses as Int
- Choose one: store as Int or keep as String

### Priority 3: Create category_stats view
- Aggregate RFQs by category for dashboard
- Include counts, budgets, status breakdowns

### Priority 4: Add proper error handling with Postgres codes
- Current error handling is generic (line 75-80)
- Need detailed error codes for RLS violations, constraints, etc.
