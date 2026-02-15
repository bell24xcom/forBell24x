# Oracle Cloud Always Free N8N Deployment

This setup deploys N8N on Oracle Cloud Always Free tier with **zero ongoing costs**.

## 🆓 What's Included

- **N8N Instance**: Latest version with all features
- **PostgreSQL Database**: Connected to Neon (free tier)
- **Redis Cache**: Connected to Upstash (free tier)
- **SSL/HTTPS**: Self-signed certificates (upgrade to Let's Encrypt later)
- **Nginx Reverse Proxy**: With rate limiting and security headers
- **Auto-restart**: Services restart automatically if they fail

## 🚀 Quick Start

### 1. Create Oracle Cloud Always Free Instance

1. Go to [Oracle Cloud](https://cloud.oracle.com)
2. Sign up for Always Free tier
3. Create a new VM instance:
   - **Shape**: VM.Standard.E2.1.Micro (Always Free)
   - **OS**: Ubuntu 20.04 or 22.04
   - **SSH Key**: Upload your public key
4. Note the public IP address

### 2. Connect to Your Instance

```bash
ssh -i your-key.pem ubuntu@your-server-ip
```

### 3. Clone and Setup

```bash
# Clone this repository
git clone https://github.com/your-username/bell24h.git
cd bell24h/oracle-cloud-n8n

# Make setup script executable
chmod +x setup-oracle-cloud.sh

# Run setup
./setup-oracle-cloud.sh
```

### 4. Configure Environment

```bash
# Edit environment file
nano .env
```

Fill in your values:

```env
# N8N Configuration
N8N_ADMIN_PASSWORD=your-secure-password
N8N_HOST=your-server-ip
WEBHOOK_URL=https://your-server-ip

# Database (Neon)
DB_HOST=ep-xxx.us-east-1.aws.neon.tech
DB_NAME=neondb
DB_USER=your-username
DB_PASSWORD=your-password

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER=Bell24h <noreply@bell24h.com>

# Redis (Upstash)
REDIS_URL=rediss://default:password@xxx.upstash.io:6379
```

### 5. Start Services

```bash
# Start N8N
docker-compose up -d

# Check logs
docker-compose logs -f n8n
```

### 6. Access N8N

- **URL**: `https://your-server-ip`
- **Username**: `admin`
- **Password**: (from your .env file)

## 🔧 Configuration

### Database Setup (Neon)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env` with database details

### Redis Setup (Upstash)

1. Go to [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the connection URL and token
4. Update `.env` with Redis details

### Email Setup (Gmail)

1. Enable 2-factor authentication on Gmail
2. Generate an App Password
3. Use the App Password in `.env`

## 📊 Monitoring

### Check Service Status

```bash
# Check all services
docker-compose ps

# Check N8N logs
docker-compose logs n8n

# Check Nginx logs
docker-compose logs nginx
```

### Restart Services

```bash
# Restart N8N
docker-compose restart n8n

# Restart all services
docker-compose restart
```

## 🔒 Security

### Firewall Configuration

The setup includes UFW firewall with:
- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- N8N (port 5678) - optional

### SSL Certificates

- Self-signed certificates are created automatically
- For production, replace with Let's Encrypt certificates

### Rate Limiting

- API requests: 10 requests/second
- Webhook requests: 5 requests/second

## 🚨 Troubleshooting

### N8N Won't Start

```bash
# Check logs
docker-compose logs n8n

# Common issues:
# 1. Database connection failed - check DB_* variables
# 2. Redis connection failed - check REDIS_URL
# 3. Port already in use - check if another service is using port 5678
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec n8n n8n user:list

# Check database variables
docker-compose exec n8n env | grep DB_
```

### SSL Issues

```bash
# Regenerate SSL certificates
rm ssl/cert.pem ssl/key.pem
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Bell24h/OU=IT/CN=n8n.bell24h.com"
```

## 💰 Cost Breakdown

- **Oracle Cloud VM**: $0/month (Always Free)
- **Neon Database**: $0/month (free tier)
- **Upstash Redis**: $0/month (free tier)
- **Total**: $0/month

## 🔄 Updates

### Update N8N

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Backup Workflows

```bash
# Backup workflows
docker-compose exec n8n tar -czf /tmp/workflows.tar.gz /home/node/.n8n/workflows
docker cp bell24h-n8n:/tmp/workflows.tar.gz ./workflows-backup.tar.gz
```

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f n8n`
2. Verify environment variables: `docker-compose exec n8n env`
3. Test database connection: `docker-compose exec n8n n8n user:list`
4. Check firewall: `sudo ufw status`

## 🎯 Next Steps

After N8N is running:

1. **Import Bell24h Workflows**: Use the workflows from `client/n8n-workflows/`
2. **Test Webhooks**: Verify webhook endpoints are working
3. **Configure Email**: Set up email templates and SMTP
4. **Monitor Performance**: Set up monitoring and alerts
5. **Backup Strategy**: Implement regular backups

---

**Total Setup Time**: ~30 minutes  
**Monthly Cost**: $0  
**Uptime**: 99.9% (Oracle Cloud SLA)
