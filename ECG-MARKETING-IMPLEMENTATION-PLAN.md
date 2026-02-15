# 📧 **ECG MARKETING IMPLEMENTATION PLAN FOR BELL24H**

## 🎯 **OVERVIEW**

**ECG Marketing** = **Email, Campaign, Growth** Marketing  
**Status**: ❌ Not implemented (0%)  
**Priority**: 🔴 High (Required for full marketing automation)

---

## 📊 **WHAT IS ECG MARKETING?**

**ECG Marketing** is a comprehensive marketing automation system that includes:

1. **E**mail Campaigns
2. **C**ampaign Management
3. **G**rowth Marketing (SMS, WhatsApp, Push)

**Goal**: Automated marketing campaigns to acquire and retain users

---

## ✅ **CURRENT MARKETING STATUS**

### **What Exists:**
- ✅ `/admin/cms` - Content Management System
- ✅ Email templates in CMS
- ✅ Campaign management UI
- ✅ Resend API configured
- ✅ MSG91 SMS configured
- ✅ Marketing plan documents

### **What's Missing:**
- ❌ Email campaign automation
- ❌ SMS campaign automation
- ❌ WhatsApp campaign automation
- ❌ Lead nurturing workflows
- ❌ Customer journey mapping
- ❌ Marketing analytics
- ❌ A/B testing for campaigns

---

## 🚀 **IMPLEMENTATION PLAN**

### **PHASE 1: EMAIL MARKETING (Week 1)**

#### **1.1 Email Service Integration**

**File**: `client/src/lib/email/resend.ts`
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Bell24H <no-reply@bell24h.com>',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  return await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}
```

#### **1.2 Email Templates**

**File**: `client/src/lib/email/templates/welcome.ts`
```typescript
export function getWelcomeEmailTemplate(name: string) {
  return `
    <html>
      <body>
        <h1>Welcome to Bell24H, ${name}!</h1>
        <p>Your B2B marketplace for faster, smarter transactions.</p>
        <a href="https://bell24h.com/dashboard">Go to Dashboard</a>
      </body>
    </html>
  `;
}
```

**Templates Needed:**
- Welcome email
- OTP email
- RFQ notification email
- Quote received email
- Order confirmation email
- Marketing campaign emails

#### **1.3 Email Campaign API**

**File**: `client/src/app/api/marketing/email/send/route.ts`
```typescript
import { sendEmail } from '@/lib/email/resend';
import { getWelcomeEmailTemplate } from '@/lib/email/templates/welcome';

export async function POST(request: Request) {
  const { to, template, data } = await request.json();
  
  let html = '';
  switch (template) {
    case 'welcome':
      html = getWelcomeEmailTemplate(data.name);
      break;
    // ... other templates
  }
  
  await sendEmail({ to, subject: 'Welcome to Bell24H', html });
  
  return Response.json({ success: true });
}
```

---

### **PHASE 2: SMS MARKETING (Week 1)**

#### **2.1 SMS Service Integration**

**File**: `client/src/lib/sms/msg91.ts`
```typescript
import axios from 'axios';

export async function sendSMS({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  const response = await axios.post('https://control.msg91.com/api/v5/flow/', {
    template_id: process.env.MSG91_FLOW_ID,
    sender: process.env.MSG91_SENDER_ID,
    short_url: '0',
    mobiles: to,
    message: message,
  }, {
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY,
    },
  });
  
  return response.data;
}
```

#### **2.2 SMS Campaign API**

**File**: `client/src/app/api/marketing/sms/send/route.ts`
```typescript
import { sendSMS } from '@/lib/sms/msg91';

export async function POST(request: Request) {
  const { to, message } = await request.json();
  
  await sendSMS({ to, message });
  
  return Response.json({ success: true });
}
```

---

### **PHASE 3: WHATSAPP MARKETING (Week 2)**

#### **3.1 WhatsApp Integration**

**Option A: Twilio WhatsApp API**
- Requires Twilio account
- WhatsApp Business API access

**Option B: WhatsApp Business API (Direct)**
- Requires Facebook Business verification
- More complex setup

**Option C: n8n WhatsApp Integration**
- Use n8n workflows
- Connect to WhatsApp Business API
- Easier automation

**Recommended**: Use n8n for WhatsApp automation

---

### **PHASE 4: MARKETING AUTOMATION (Week 2)**

#### **4.1 Lead Nurturing Workflows**

**n8n Workflow**: "New User Onboarding"
1. Trigger: User signs up
2. Day 0: Send welcome email
3. Day 1: Send "How to create RFQ" email
4. Day 3: Send "Browse suppliers" email
5. Day 7: Send "Complete your profile" email
6. Day 14: Send "First RFQ discount" email

**n8n Workflow**: "Supplier Onboarding"
1. Trigger: Supplier claims profile
2. Day 0: Send welcome SMS + email
3. Day 1: Send "Add products" email
4. Day 3: Send "Complete profile" email
5. Day 7: Send "First RFQ match" notification

#### **4.2 Campaign Management**

**File**: `client/src/app/api/marketing/campaigns/route.ts`
```typescript
// GET /api/marketing/campaigns - List campaigns
// POST /api/marketing/campaigns - Create campaign
// PUT /api/marketing/campaigns/[id] - Update campaign
// DELETE /api/marketing/campaigns/[id] - Delete campaign
```

**Campaign Types:**
- Email campaigns
- SMS campaigns
- WhatsApp campaigns
- Push notification campaigns
- Multi-channel campaigns

---

### **PHASE 5: MARKETING ANALYTICS (Week 3)**

#### **5.1 Campaign Analytics**

**File**: `client/src/app/api/marketing/analytics/route.ts`
```typescript
// Campaign metrics:
// - Sent count
// - Opened count
// - Clicked count
// - Conversion count
// - Open rate
// - Click rate
// - Conversion rate
```

#### **5.2 Dashboard Integration**

**Add to `/admin/cms`:**
- Campaign performance charts
- Real-time campaign stats
- A/B test results
- ROI tracking

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Backend/API**
- [ ] Create email service (`/lib/email/resend.ts`)
- [ ] Create SMS service (`/lib/sms/msg91.ts`)
- [ ] Create email templates (`/lib/email/templates/`)
- [ ] Create `/api/marketing/email/send` endpoint
- [ ] Create `/api/marketing/sms/send` endpoint
- [ ] Create `/api/marketing/campaigns` endpoints
- [ ] Create `/api/marketing/analytics` endpoint

### **Frontend/Components**
- [ ] Create email campaign builder
- [ ] Create SMS campaign builder
- [ ] Create campaign scheduler
- [ ] Create campaign analytics dashboard
- [ ] Create A/B test manager

### **n8n Workflows**
- [ ] Create "New User Onboarding" workflow
- [ ] Create "Supplier Onboarding" workflow
- [ ] Create "RFQ Follow-up" workflow
- [ ] Create "Abandoned Cart" workflow
- [ ] Create "Re-engagement" workflow

### **Database**
- [ ] Create `Campaign` model
- [ ] Create `CampaignRecipient` model
- [ ] Create `CampaignEvent` model (opens, clicks, conversions)
- [ ] Create `MarketingSegment` model

---

## 🎯 **MARKETING CAMPAIGNS TO IMPLEMENT**

### **1. Acquisition Campaigns**
- Welcome series (5 emails)
- Supplier invitation campaigns
- Referral campaigns
- Social media campaigns

### **2. Activation Campaigns**
- First RFQ creation
- First product upload
- Profile completion
- Feature discovery

### **3. Retention Campaigns**
- Re-engagement emails
- Win-back campaigns
- Feature updates
- Success stories

### **4. Revenue Campaigns**
- Premium upgrade
- Invoice discounting
- Escrow benefits
- Transaction incentives

---

## 📊 **EXPECTED RESULTS**

### **Email Marketing**
- **Open Rate**: 25-30%
- **Click Rate**: 5-8%
- **Conversion Rate**: 2-5%

### **SMS Marketing**
- **Delivery Rate**: 95%+
- **Click Rate**: 10-15%
- **Conversion Rate**: 5-10%

### **WhatsApp Marketing**
- **Delivery Rate**: 98%+
- **Read Rate**: 80%+
- **Conversion Rate**: 15-20%

---

## 🚀 **QUICK START (MVP)**

### **Week 1: Basic Email Marketing**
1. Implement email service
2. Create welcome email template
3. Send welcome email on signup
4. Create email campaign API

### **Week 2: SMS Marketing**
1. Implement SMS service
2. Create SMS templates
3. Send SMS on important events
4. Create SMS campaign API

### **Week 3: Automation**
1. Create n8n workflows
2. Set up lead nurturing
3. Create campaign scheduler
4. Add analytics tracking

---

## 📝 **NEXT STEPS**

1. **Review this plan** - Confirm ECG marketing requirements
2. **Prioritize features** - Which campaigns are most important?
3. **Start implementation** - Begin with email marketing (Week 1)
4. **Test and iterate** - Launch MVP, gather feedback, improve

---

**Status**: 📋 **PLAN READY - READY FOR IMPLEMENTATION**  
**Estimated Time**: 2-3 weeks for full implementation  
**Priority**: 🔴 **HIGH** - Required for marketing automation

