# Vercel Environment Variables Setup Guide

This guide will help you configure the correct environment variables for Vercel deployment to fix the current deployment failures.

## 🔴 Current Issues
- BigInt serialization errors
- Redis connection failures (ECONNREFUSED 127.0.0.1:6379)
- Database connection failures (ECONNREFUSED 127.0.0.1:5432)

## ✅ Required Environment Variables

### 1. Database Configuration (Neon/Supabase)

**Option A: Neon Database (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel Environment Variables:

```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Option B: Supabase Database**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to Vercel Environment Variables:

```
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres?sslmode=require
```

### 2. Redis Configuration (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the connection details
4. Add to Vercel Environment Variables:

```
REDIS_URL=rediss://default:password@xxx.upstash.io:6379
REDIS_TOKEN=your-redis-token
```

### 3. N8N Configuration (Optional)

```
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Other Required Variables

```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://www.bell24h.com
JWT_SECRET=your-jwt-secret-key
```

## 🚀 Setup Steps

### Step 1: Set up Neon Database
1. Visit [neon.tech](https://neon.tech)
2. Sign up/Login
3. Create new project: "bell24h-production"
4. Copy the connection string
5. Add to Vercel: `DATABASE_URL`

### Step 2: Set up Upstash Redis
1. Visit [upstash.com](https://upstash.com)
2. Sign up/Login
3. Create new Redis database: "bell24h-cache"
4. Copy URL and Token
5. Add to Vercel: `REDIS_URL` and `REDIS_TOKEN`

### Step 3: Update Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select your project: bell24h-v1
3. Go to Settings > Environment Variables
4. Add all the variables listed above
5. Redeploy the project

### Step 4: Run Database Migration
After setting up the database, run:

```bash
cd client
npx prisma generate
npx prisma migrate deploy
```

## 🔧 Vercel Dashboard Steps

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Project**: bell24h-v1
3. **Settings Tab**: Click on "Settings"
4. **Environment Variables**: Click on "Environment Variables"
5. **Add Variables**: Add each variable with the correct value
6. **Redeploy**: Go to "Deployments" and click "Redeploy" on the latest deployment

## ✅ Verification

After setting up all environment variables:

1. **Check Health Endpoint**: https://www.bell24h.com/api/health/simple
2. **Check Main Site**: https://www.bell24h.com
3. **Check Vercel Logs**: Look for successful deployment logs

## 🆘 Troubleshooting

### If deployments still fail:
1. Check Vercel function logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure database connection string includes `?sslmode=require`
4. Test database connection locally with the new connection string

### Common Issues:
- **Database SSL**: Make sure connection string includes `?sslmode=require`
- **Redis URL**: Use `rediss://` (with 's') for secure connection
- **Environment Variables**: Ensure they're set for "Production" environment

## 📞 Support

If you need help with any of these steps, the configuration files are already updated in the codebase to work with these external services.
