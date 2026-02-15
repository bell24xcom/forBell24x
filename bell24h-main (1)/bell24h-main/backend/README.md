# BELL24h Backend API

FastAPI backend for BELL24h B2B marketplace with SHAP/LIME AI explanations.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- pip

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server
python -m uvicorn dev_server:app --reload --port=8000
```

Or on Windows:
```bash
py -m uvicorn dev_server:app --reload --port=8000
```

Or use the batch file:
```bash
start_server.bat
```

### Test Health Endpoint

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "dev",
  "service": "bell24h-backend"
}
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       └── ai.py          # AI endpoints
│   ├── models/
│   │   └── rfq_model.pkl      # Trained ML model
│   └── services/
│       └── ai_services.py     # AI service with SHAP/LIME
├── dev_server.py              # FastAPI application
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker configuration
├── Caddyfile                  # Caddy reverse proxy config
├── deploy.sh                  # Deployment script
└── start_server.bat           # Windows startup script
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

### AI Explanations
```
POST /api/v1/ai/explain-match/{supplier_id}
Body: {
  "price": 125000,
  "lead_time": 7,
  "supplier_rating": 4.8,
  ...
}
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t bell24h-backend:latest .
```

### Run Container
```bash
docker run -d \
  --name bell24h-prod \
  -p 8000:8000 \
  --restart unless-stopped \
  bell24h-backend:latest
```

## 🌐 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

Quick deployment:
```bash
./deploy.sh
```

## 🔧 Configuration

### Environment Variables
- `ENVIRONMENT`: `dev` or `production`
- `MSG91_API_KEY`: MSG91 API key for OTP
- `MSG91_SENDER_ID`: MSG91 sender ID

### Model Path
The AI service automatically detects the model at:
- `app/models/rfq_model.pkl`

## 📊 AI Features

- **SHAP Explanations**: Feature importance with force plots and waterfall plots
- **LIME Explanations**: Local interpretable model-agnostic explanations
- **RFQ Matching**: ML-based supplier matching

## 🐛 Troubleshooting

### Model not loading
- Check if `app/models/rfq_model.pkl` exists
- Check container logs: `docker logs bell24h-prod`
- Verify model file permissions

### Port already in use
- Change port in `uvicorn` command: `--port=8001`
- Or kill process using port 8000: `sudo lsof -ti:8000 | xargs kill`

### Import errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.11+)

## 📝 License

Proprietary - BELL24h

---

**Built with FastAPI, SHAP, LIME, and ❤️**

