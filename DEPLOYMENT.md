# 🚀 BELL24h Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Required Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
NEON_DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"
HUGGINGFACE_API_KEY="hf_your-huggingface-key"

# Payment Gateways
RAZORPAY_KEY_ID="rzp_test_your-key"
RAZORPAY_KEY_SECRET="your-secret"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"

# Escrow Integration
KREDX_API_KEY="your-kredx-key"
KREDX_API_URL="https://api.kredx.com/v1"

# SMS/OTP
MSG91_AUTH_KEY="your-msg91-key"
MSG91_TEMPLATE_ID="your-template-id"

# Blockchain
POLYGON_RPC_URL="https://polygon-rpc.com"
PRIVATE_KEY="your-private-key"
CONTRACT_ADDRESS="your-contract-address"

# Monitoring
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3000"
```

## 🌐 **Vercel Deployment**

### **1. Connect Repository**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### **2. Configure Environment Variables**
```bash
# Set all required environment variables in Vercel dashboard
# Go to: Project Settings > Environment Variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add OPENAI_API_KEY
# ... add all other variables
```

### **3. Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🐳 **Docker Deployment**

### **1. Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build application
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### **2. Create docker-compose.yml**
```yaml
version: '3.8'

services:
  bell24h:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=bell24h
      - POSTGRES_USER=bell24h
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### **3. Deploy with Docker**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ **AWS Deployment**

### **1. EC2 Instance Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### **2. Application Setup**
```bash
# Clone repository
git clone https://github.com/digitex-erp/bell24h.git
cd bell24h

# Install dependencies
npm install
cd client && npm install && cd ..

# Build application
cd client && npm run build && cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **3. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 **Production Configuration**

### **1. Database Setup**
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed
```

### **2. SSL Certificate**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### **3. Monitoring Setup**
```bash
# Install Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
cd prometheus-2.45.0.linux-amd64

# Start Prometheus
./prometheus --config.file=prometheus.yml
```

## 📊 **Health Checks**

### **1. Application Health**
```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/health/db

# Check AI services
curl http://localhost:3000/api/health/ai
```

### **2. Performance Monitoring**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs bell24h

# Monitor resources
pm2 monit
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**
   ```bash
   # Check database URL
   echo $DATABASE_URL
   
   # Test connection
   npx prisma db push
   ```

2. **Build Failures**
   ```bash
   # Clear cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Missing**
   ```bash
   # Check all required variables
   env | grep -E "(DATABASE_URL|NEXTAUTH_SECRET|OPENAI_API_KEY)"
   ```

## 📈 **Scaling**

### **Horizontal Scaling**
```bash
# Add more PM2 instances
pm2 scale bell24h 4

# Use PM2 cluster mode
pm2 start ecosystem.config.js --instances max
```

### **Load Balancing**
```nginx
upstream bell24h {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    location / {
        proxy_pass http://bell24h;
    }
}
```

## 🔐 **Security Checklist**

- ✅ **Environment Variables** - All secrets in environment
- ✅ **SSL Certificate** - HTTPS enabled
- ✅ **Firewall** - Only necessary ports open
- ✅ **Database Security** - Strong passwords and access control
- ✅ **API Rate Limiting** - Prevent abuse
- ✅ **CORS Configuration** - Proper cross-origin settings
- ✅ **CSRF Protection** - Token validation enabled

## 📞 **Support**

For deployment issues:
- Check logs: `pm2 logs bell24h`
- Monitor resources: `pm2 monit`
- Database status: `npx prisma db push`
- Health check: `curl http://localhost:3000/api/health`

---

**🚀 Your BELL24h platform is now ready for production deployment!**
