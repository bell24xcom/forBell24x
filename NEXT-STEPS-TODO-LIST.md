# BELL24h.com - Next Steps Todo List
**Based on One-Page Summary | Launch: 15-30 Nov 2025 | Status: Deployment Pending**

---

## 🔴 CRITICAL - IMMEDIATE (Launch Blockers)

### Deployment & Infrastructure
- [ ] **Fix Docker build on Oracle VM** - Resolve `@cloudflare/next-on-pages` dependency conflicts and prisma copy path issues
- [ ] **Configure Neon Database** - Set `DATABASE_URL` in `.env.production` on Oracle VM
- [ ] **Set up NEXTAUTH_SECRET** - Generate and configure in production environment (run `fix-secret.sh`)
- [ ] **Test Docker container** - Build and run successfully on Oracle VM (port 3000)
- [ ] **Configure Nginx reverse proxy** - Set up HTTPS/SSL with Let's Encrypt (certbot)

### Payment & Authentication
- [ ] **Integrate RazorpayX** - Get API keys and configure payment gateway in production
- [ ] **Set up RazorpayX wallet** - Configure webhook endpoints for payment callbacks
- [ ] **Configure MSG91 SMS** - Get API keys and test OTP delivery for authentication
- [ ] **Test OTP login flow** - End-to-end test (send OTP → verify → login) in production

### Automation & Workflows
- [ ] **Activate n8n workflows** - Ensure all workflows (A-J) are active, webhook conflicts resolved
- [ ] **Test n8n automation** - Verify email/SMS marketing triggers work correctly

**Target Completion:** 15 November 2025 (Launch Day)

---

## 🟠 HIGH PRIORITY - PRE-LAUNCH (Nov 15-30)

### Technical Setup
- [ ] **Set up Google Analytics** - Configure events for supplier/buyer actions tracking
- [ ] **Configure Cloudflare DNS** - Ensure A records point to Oracle VM (80.225.192.248)
- [ ] **Set up SSL certificate** - Cloudflare or Let's Encrypt for HTTPS security
- [ ] **Error monitoring** - Configure Sentry or similar for production error tracking
- [ ] **Landing page optimization** - Pricing tiers (Free/Pro/Enterprise) with signup CTA

### Revenue Systems
- [ ] **Subscription payment flow** - Implement Pro (₹1,500/mo or ₹15K/year with 20% discount)
- [ ] **Transaction fee system** - Set up 2-3% fee collection on successful RFQ-quote matches
- [ ] **Escrow payment flow** - Implement 1-2% fee structure for high-value transactions
- [ ] **Featured listing payments** - Configure ₹5K/month per supplier payment system

**Target Completion:** 30 November 2025 (Public Beta Ready)

---

## 🟡 MEDIUM PRIORITY - MONTH 1 (Dec 2025)

### Supplier Acquisition (Target: 100 suppliers)
- [ ] **Recruit early adopters** - Manual outreach to 100 suppliers (Month 1 target)
- [ ] **Scrape supplier data** - 50,000 profiles from IndiaMART/Justdial (data seeding)
- [ ] **Supplier onboarding automation** - n8n workflow for welcome emails/SMS
- [ ] **First 10 paying subscribers** - Onboard Pro tier (₹15K/year) suppliers by Month 3

### AI Features
- [ ] **SHAP/LIME explainability** - Implement AI matching explanations (premium feature)
- [ ] **Predictive analytics dashboard** - RFQ success rates, supplier reliability scores

### Additional Revenue Streams
- [ ] **KredX integration** - Invoice discounting API (0.5% fee on invoice financing)
- [ ] **Wallet withdrawal fees** - Set up ₹50/month per user withdrawal fee system
- [ ] **API access tier** - Configure ₹10K/month enterprise API access

**Target Revenue:** ₹50K (Month 2) | ₹1.5L (Month 3)

---

## 🟢 GROWTH PRIORITY - MONTH 2-6 (Jan-Jun 2026)

### Marketing & Acquisition (Target: 5,000 suppliers by Month 6)
- [ ] **WhatsApp campaigns** - Target Tier-2 cities (Surat, Ludhiana, etc.)
- [ ] **YouTube ad campaigns** - B2B marketplace awareness and supplier acquisition
- [ ] **Partner with UAE/Dubai Chambers** - 5,000+ international suppliers
- [ ] **LinkedIn lead generation** - B2B supplier outreach automation via n8n

### Analytics & Metrics
- [ ] **Analytics dashboard** - Track: MAU (Suppliers/Buyers), GMV, Take Rate, CAC, LTV
- [ ] **Revenue reporting** - Daily/weekly automated reports via n8n (vs Month 1-12 targets)
- [ ] **Conversion tracking** - Monitor signup → paid subscription conversion rates

**Target Milestones:**
- Month 4: 500 suppliers, ₹3L revenue
- Month 5: 1,000 suppliers, ₹5L revenue
- Month 6: 2,000 suppliers, ₹8L revenue

---

## 📊 MONTHLY REVENUE TARGETS

| Month | Revenue Target | Key Actions |
|-------|---------------|-------------|
| **Month 1** | ₹0 | Launch, 100 suppliers onboarded |
| **Month 2** | ₹50K | 100 suppliers, first transactions |
| **Month 3** | ₹1.5L | First 10 paid subscriptions |
| **Month 4** | ₹3L | 500 suppliers, transaction fees start |
| **Month 5** | ₹5L | 1,000 suppliers, escrow activated |
| **Month 6** | ₹8L | 2,000 suppliers, featured listings live |

**Break-Even:** Month 8-10 (₹18-25L/month) | **Cash Flow Positive:** Month 10-12 (₹35-75L/month)

---

## ✅ SUCCESS CRITERIA

### Technical
- ✅ Docker build successful
- ✅ Oracle VM live with HTTPS
- ✅ Payment gateway integrated
- ✅ OTP authentication working
- ✅ n8n workflows active

### Business
- ✅ 100 suppliers by Month 1
- ✅ 10 paid subscriptions by Month 3
- ✅ ₹50K revenue by Month 2
- ✅ ₹1.5L revenue by Month 3
- ✅ 5,000 suppliers by Month 6

### Metrics
- ✅ 70%+ wallet activation rate
- ✅ <₹500 Customer Acquisition Cost (CAC)
- ✅ ₹15K+ Lifetime Value (LTV) per supplier
- ✅ 8-12% take rate (subscriptions + fees)

---

## 🚨 CRITICAL WARNINGS

1. **Speed to Market:** Launch in 30 days or IndiaMART copies features
2. **Cash Flow:** Need ₹5L revenue by Month 6 or risk shutdown
3. **Supplier Acquisition:** 5,000+ suppliers in 6 months is non-negotiable
4. **Network Effect:** GMV must reach ₹30Cr Year 1 for sustainable growth

---

**Last Updated:** 13 November 2025 | **Next Review:** Weekly until launch | **Owner:** BELL24h Team

