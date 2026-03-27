# 📋 **ALL API ROUTES & FUNCTIONS SUMMARY**

**Project:** Bell24H  
**Date:** November 16, 2025  
**Status:** ✅ All APIs Ready & Functional

---

## 🔐 **AUTHENTICATION APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/auth/send-otp` | POST | Send OTP to mobile number | ✅ Ready |
| `/api/auth/verify-otp` | POST | Verify OTP and login | ✅ Ready |
| `/api/auth/demo-login` | POST | Temporary demo login bypass | ✅ Ready |
| `/api/auth/resend-otp` | POST | Resend OTP | ✅ Ready |
| `/api/otp/send` | POST | Alternative OTP send endpoint | ✅ Ready |
| `/api/otp/verify` | POST | Alternative OTP verify endpoint | ✅ Ready |

---

## 👥 **SUPPLIER APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/supplier/profile` | GET/PUT | Get/Update supplier profile | ✅ Ready |
| `/api/supplier/products` | GET/POST | List/Create supplier products | ✅ Ready |
| `/api/supplier/products/[id]` | GET/PUT/DELETE | Get/Update/Delete product | ✅ Ready |
| `/api/suppliers` | GET | List all suppliers | ✅ Ready |

---

## 📝 **RFQ APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/rfq/create` | POST | Create new RFQ (text/voice/video) | ✅ Ready |

---

## 🤖 **AI APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/ai/explanations` | POST | Get AI explanations for matches | ✅ Ready |
| `/api/v1/ai/explain` | POST | AI explainability endpoint | ✅ Ready |
| `/api/analytics/predictive` | GET | Predictive analytics data | ✅ Ready |
| `/api/analytics/stock-data` | GET | Stock market data for insights | ✅ Ready |

---

## 🏥 **HEALTH CHECK APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/health` | GET | General application health | ✅ Ready |
| `/api/health/ai` | GET | AI service health check | ✅ Ready |
| `/api/health/db` | GET | Database connection health | ✅ Ready |

---

## 🏢 **COMPANY/CLAIM APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/claim/company` | POST | Claim company profile | ✅ Ready |
| `/api/claim/verify` | POST | Verify company claim | ✅ Ready |

---

## 🎬 **DEMO APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/demo/audio/[id]` | GET | Get demo audio file | ✅ Ready |
| `/api/demo/video/[id]` | GET | Get demo video file | ✅ Ready |

---

## 👨‍💼 **ADMIN APIs**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/admin/ab-test/stats` | GET | A/B test statistics | ✅ Ready |
| `/api/admin/performance` | GET | Performance metrics | ✅ Ready |
| `/api/admin/tasks/pending` | GET | Pending admin tasks | ✅ Ready |

---

## 📄 **PAGE ROUTES (All Ready)**

### **Dashboard Routes:**
- ✅ `/dashboard` - Main dashboard with Buyer/Supplier tabs
- ✅ `/dashboard/ai-features` - AI Features Hub
- ✅ `/dashboard/ai-insights` - AI Insights & Explanations
- ✅ `/dashboard/voice-rfq` - Voice RFQ creation
- ✅ `/dashboard/video-rfq` - Video RFQ creation
- ✅ `/dashboard/negotiations` - Negotiations management
- ✅ `/dashboard/supplier-risk` - Supplier risk analysis
- ✅ `/dashboard/invoice-discounting` - Invoice discounting
- ✅ `/dashboard/crm` - CRM dashboard
- ✅ `/dashboard/comprehensive` - Comprehensive analytics
- ✅ `/dashboard/n8n` - N8N workflows

### **Supplier Routes:**
- ✅ `/supplier/dashboard` - Supplier dashboard
- ✅ `/supplier/profile/edit` - Edit supplier profile
- ✅ `/supplier/products/manage` - Manage products
- ✅ `/supplier/products/showcase` - Product showcase
- ✅ `/supplier/registration` - Supplier registration
- ✅ `/supplier/gst` - GST & Tax information
- ✅ `/supplier/contact` - Contact details
- ✅ `/supplier/messaging` - Messaging with buyers

### **Buyer Routes:**
- ✅ `/rfq` - RFQ list
- ✅ `/rfq/[id]` - RFQ details
- ✅ `/suppliers` - Browse suppliers
- ✅ `/suppliers/[slug]` - Supplier profile view
- ✅ `/wallet` - Wallet & Escrow

### **Auth Routes:**
- ✅ `/auth/login-otp` - OTP login
- ✅ `/auth/demo-login` - Demo login page

---

## 🚀 **DEPLOYMENT STATUS**

### **✅ Code Status:**
- ✅ All code committed to GitHub
- ✅ All API routes functional
- ✅ All page routes ready
- ✅ Role-based dashboard implemented

### **❌ Deployment Status:**
- ❌ **NOT YET DEPLOYED to Oracle Cloud**
- ❌ GitHub Actions may not have auto-deployed
- ⚠️ **YOU NEED TO DEPLOY VIA SSH OR TRIGGER WORKFLOW**

---

## 📝 **DEPLOYMENT INSTRUCTIONS**

### **Option 1: Check GitHub Actions (Auto-Deploy)**
1. Visit: `https://github.com/digitex-erp/bell24h/actions`
2. Check if "Deploy Bell24H to Oracle VM" workflow ran
3. If not, click "Run workflow" → Select "main" → Run

### **Option 2: Manual Deploy via SSH**
```bash
# SSH into Oracle Cloud
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Then run:
cd ~/bell24h
git fetch origin main
git reset --hard origin/main
docker stop bell24h && docker rm bell24h
docker build -t bell24h:latest -f Dockerfile .
docker run -d --name bell24h --restart always -p 3000:3000 --env-file ~/bell24h/client/.env.production bell24h:latest
sudo systemctl restart nginx
```

---

**All APIs and routes are ready! Just need to deploy to Oracle Cloud.**

