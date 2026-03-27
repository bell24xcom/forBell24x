# n8n Workflows for BELL24h

This directory contains n8n workflow definitions for BELL24h automation.

## 📁 Files

- `workflows/rfq-ai-matching.json` - RFQ AI Matching workflow with SHAP/LIME
- `workflows/marketing-automation.json` - Marketing automation for supplier onboarding
- `N8N_WORKFLOW_SETUP.md` - Complete setup guide
- `test-workflows.sh` - Test script for workflows

## 🚀 Quick Start

### 1. Import Workflows

1. Open n8n editor: `https://n8n.bell24h.com`
2. Click **"Workflows"** → **"Import from File"**
3. Import `workflows/rfq-ai-matching.json`
4. Import `workflows/marketing-automation.json`

### 2. Configure Environment Variables

In n8n Settings → Environment Variables, add:
- `MSG91_API_KEY`
- `MSG91_RFQ_WINNER_TEMPLATE_ID`
- `MSG91_WELCOME_TEMPLATE_ID`
- `MSG91_VERIFICATION_REMINDER_TEMPLATE_ID`
- `GOOGLE_SHEETS_RFQ_LOG_ID` (optional)
- `GOOGLE_SHEETS_SUPPLIERS_ID` (optional)

### 3. Activate Workflows

Toggle the **"Active"** switch on each workflow.

### 4. Test Workflows

Run the test script:
```bash
chmod +x test-workflows.sh
./test-workflows.sh
```

Or test manually:
```bash
# Test RFQ webhook
curl -X POST https://n8n.bell24h.com/webhook/rfq-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1001,
    "price": 125000,
    "supplier_id": 1,
    "supplier_phone": "+919819049523"
  }'

# Test Supplier webhook
curl -X POST https://n8n.bell24h.com/webhook/supplier-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Test Supplier",
    "mobile": "+919819049523"
  }'
```

## 📊 Workflows

### RFQ AI Matching

**Webhook**: `https://n8n.bell24h.com/webhook/rfq-new`

**Flow**:
1. Receive RFQ via webhook
2. Call SHAP API for AI predictions
3. Extract winner from SHAP results
4. Send SMS to winner via MSG91
5. Log to Google Sheets (optional)
6. Generate SHAP report

### Marketing Automation

**Webhook**: `https://n8n.bell24h.com/webhook/supplier-new`

**Flow**:
1. Receive new supplier registration
2. Send welcome SMS
3. Wait 24 hours
4. Check verification status
5. Add to Active Suppliers or send reminder

## 🔧 Configuration

See [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md) for detailed configuration instructions.

## 🐛 Troubleshooting

See [N8N_WORKFLOW_SETUP.md](./N8N_WORKFLOW_SETUP.md#-troubleshooting) for troubleshooting guide.

## 📚 Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [MSG91 API Documentation](https://docs.msg91.com/)
- [BELL24h Backend API](../README.md)

---

**Workflows ready to import! 🚀**

