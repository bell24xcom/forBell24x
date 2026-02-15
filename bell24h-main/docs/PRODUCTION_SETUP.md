# Bell24h Production Setup Guide

## 🚀 Complete Production Deployment Guide

This guide will help you set up Bell24h for production deployment with all necessary configurations.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Vercel account
- MSG91 account for OTP
- Domain name (bell24h.com)

## 🗄️ Database Setup

### 1. PostgreSQL Database

Choose one of the following options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb bell24h_production

# Create user
sudo -u postgres createuser bell24h_user
sudo -u postgres psql -c "ALTER USER bell24h_user PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bell24h_production TO bell24h_user;"
```

#### Option B: Cloud Database (Recommended)
- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **PlanetScale**: https://planetscale.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)

### 2. Database Migration

```bash
# Copy environment template
cp production.env.template .env.local

# Edit .env.local with your database credentials
nano .env.local

# Run database setup
npm run db:setup

# Or manually:
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 🔐 Environment Variables Setup

### Required Environment Variables

Create `.env.local` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"

# MSG91 OTP Configuration
MSG91_AUTH_KEY="your_msg91_auth_key"
MSG91_TEMPLATE_ID="your_template_id"
MSG91_SENDER_ID="BELL24H"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_32_chars_min"
NEXTAUTH_URL="https://www.bell24h.com"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://www.bell24h.com"
NEXT_PUBLIC_APP_NAME="Bell24h"
NEXT_PUBLIC_APP_DESCRIPTION="India's Leading AI-Powered B2B Marketplace"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="bell24h.com"

# Payment Gateway (Optional)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email (Optional)
SENDGRID_API_KEY="your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@bell24h.com"

# Security
JWT_SECRET="your_jwt_secret_32_chars_min"
ENCRYPTION_KEY="your_encryption_key_32_chars_min"

# Feature Flags
ENABLE_VOICE_RFQ=true
ENABLE_AI_MATCHING=true
ENABLE_ESCROW_PAYMENTS=true
ENABLE_REAL_TIME_NOTIFICATIONS=true
```

## 📱 MSG91 Setup

### 1. Create MSG91 Account
1. Go to https://msg91.com
2. Sign up for an account
3. Complete verification process

### 2. Get API Credentials
1. Login to MSG91 dashboard
2. Go to API section
3. Generate Auth Key
4. Create a template for OTP

### 3. Configure Template
Create an OTP template with the following content:
```
Your Bell24h OTP is {{otp}}. Valid for 10 minutes. Do not share with anyone.
```

### 4. Update Environment Variables
```env
MSG91_AUTH_KEY="your_auth_key_from_msg91"
MSG91_TEMPLATE_ID="your_template_id_from_msg91"
MSG91_SENDER_ID="BELL24H"
```

## 🌐 Domain Configuration

### 1. Vercel Domain Setup
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Domains
4. Add `www.bell24h.com` and `bell24h.com`
5. Configure DNS records as instructed

### 2. DNS Configuration
Add the following DNS records:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### 3. SSL Certificate
Vercel automatically provides SSL certificates for custom domains.

## 🚀 Deployment

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add MSG91_AUTH_KEY
vercel env add MSG91_TEMPLATE_ID
vercel env add MSG91_SENDER_ID
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### 2. Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all required variables from `.env.local`

## 🔍 Health Check

After deployment, check the health endpoint:
```
https://www.bell24h.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": {
    "connected": true,
    "latency": 45,
    "tables": {
      "users": 0,
      "rfqs": 0,
      "quotes": 0,
      "transactions": 0
    }
  },
  "memory": {
    "used": 50,
    "total": 100,
    "external": 10
  }
}
```

## 🛡️ Security Checklist

- [ ] All environment variables are set
- [ ] Database credentials are secure
- [ ] MSG91 credentials are configured
- [ ] SSL certificate is active
- [ ] Domain is properly configured
- [ ] Health check endpoint is working
- [ ] Database is accessible from Vercel

## 📊 Monitoring

### 1. Vercel Analytics
- Built-in analytics in Vercel dashboard
- Performance metrics
- Error tracking

### 2. Database Monitoring
- Monitor database performance
- Set up alerts for high usage
- Regular backups

### 3. Application Monitoring
- Health check endpoint: `/api/health`
- Error tracking with Sentry (optional)
- Log monitoring

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database is accessible from Vercel

2. **MSG91 OTP Not Sending**
   - Verify MSG91 credentials
   - Check template ID
   - Ensure sender ID is approved

3. **Domain Not Working**
   - Check DNS configuration
   - Verify domain in Vercel
   - Wait for DNS propagation (up to 24 hours)

4. **Build Failures**
   - Check environment variables
   - Verify Prisma schema
   - Check for TypeScript errors

### Support
- Check Vercel logs in dashboard
- Monitor health endpoint
- Review application logs

## 🎉 Success!

Once all steps are completed, your Bell24h platform will be live at:
- **Production URL**: https://www.bell24h.com
- **Health Check**: https://www.bell24h.com/api/health
- **Admin Dashboard**: https://www.bell24h.com/admin/dashboard

Your B2B marketplace is now ready for production use! 🚀
