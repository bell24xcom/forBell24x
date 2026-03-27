/**
 * Supplier Outreach Templates
 * Item 21: Recruit Early Adopters
 * 
 * Email and SMS templates for supplier recruitment
 */

export const supplierOutreachTemplates = {
  email: {
    initial: {
      subject: "Join Bell24h - India's #1 AI-Powered B2B Marketplace",
      body: `Dear {supplierName},

We're excited to invite you to join Bell24h, India's fastest-growing B2B marketplace powered by AI.

**Why Bell24h?**
✅ AI-powered supplier matching
✅ Voice & Video RFQ support
✅ Real-time negotiations
✅ Secure escrow payments
✅ Zero commission for first 3 months

**What You Get:**
- Free profile listing
- AI-powered buyer matching
- Direct buyer connections
- Secure payment processing
- 24/7 support

**Join 100+ Early Adopters:**
As an early adopter, you'll get:
- Free Pro tier for 6 months (worth ₹15,000)
- Priority buyer matching
- Featured listing placement
- Dedicated account manager

**Next Steps:**
1. Click here to claim your profile: {claimLink}
2. Complete your company profile (5 minutes)
3. Start receiving RFQs immediately

Questions? Reply to this email or call us at +91-XXXX-XXXXXX

Best regards,
Bell24h Team
https://bell24h.com`
    },
    followUp: {
      subject: "Reminder: Claim Your Bell24h Profile - Limited Time Offer",
      body: `Hi {supplierName},

Just a friendly reminder about your Bell24h invitation.

**Special Offer (Expires in 7 days):**
- Free Pro tier for 6 months
- Featured listing placement
- Priority support

Claim now: {claimLink}

Best,
Bell24h Team`
    }
  },
  sms: {
    initial: `Hi {supplierName}! Join Bell24h - India's #1 AI B2B Marketplace. Get FREE Pro tier for 6 months. Claim: {claimLink}`,
    followUp: `Reminder: Claim your Bell24h profile. Free Pro tier expires in 7 days. {claimLink}`
  }
};

export const generateOutreachEmail = (supplier, template = 'initial') => {
  const emailTemplate = supplierOutreachTemplates.email[template];
  return {
    to: supplier.email,
    subject: emailTemplate.subject.replace('{supplierName}', supplier.name),
    body: emailTemplate.body
      .replace(/{supplierName}/g, supplier.name)
      .replace(/{claimLink}/g, `https://bell24h.com/claim/${supplier.id}`)
  };
};

export const generateOutreachSMS = (supplier, template = 'initial') => {
  const smsTemplate = supplierOutreachTemplates.sms[template];
  return smsTemplate
    .replace(/{supplierName}/g, supplier.name)
    .replace(/{claimLink}/g, `https://bell24h.com/claim/${supplier.id}`);
};

