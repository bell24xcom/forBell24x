#!/bin/bash
# Test script for n8n workflows

set -e

echo "🧪 Testing n8n Workflows for BELL24h"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
N8N_URL="${N8N_URL:-https://n8n.bell24h.com}"
API_URL="${API_URL:-https://api.bell24h.com}"

echo ""
echo "📋 Configuration:"
echo "  n8n URL: $N8N_URL"
echo "  API URL: $API_URL"
echo ""

# Test 1: Check n8n is accessible
echo "1️⃣  Testing n8n accessibility..."
if curl -f -s "$N8N_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ n8n is accessible${NC}"
else
    echo -e "${RED}❌ n8n is not accessible${NC}"
    echo "   Check if n8n is running and accessible at $N8N_URL"
    exit 1
fi

# Test 2: Check API backend is healthy
echo "2️⃣  Testing API backend health..."
API_HEALTH=$(curl -s "$API_URL/api/health" || echo "{}")
if echo "$API_HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✅ API backend is healthy${NC}"
    echo "   Response: $API_HEALTH"
else
    echo -e "${RED}❌ API backend is not healthy${NC}"
    echo "   Response: $API_HEALTH"
    exit 1
fi

# Test 3: Test RFQ AI Matching webhook
echo "3️⃣  Testing RFQ AI Matching webhook..."
RFQ_PAYLOAD='{
  "id": 1001,
  "price": 125000,
  "lead_time": 7,
  "supplier_rating": 4.8,
  "distance_km": 89,
  "past_on_time_rate": 0.97,
  "rfq_length": 100,
  "buyer_tier": 2,
  "quantity": 300,
  "urgency_score": 0.8,
  "region": 1,
  "past_success_rate": 0.95,
  "negotiations_count": 3,
  "previous_orders": 28,
  "multimodal_rfq": 1,
  "transcript_length": 325,
  "industry_type": 1,
  "quoted_suppliers": 9,
  "supplier_id": 1,
  "supplier_phone": "+919819049523"
}'

RFQ_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/rfq-new" \
  -H "Content-Type: application/json" \
  -d "$RFQ_PAYLOAD" || echo "{}")

if echo "$RFQ_RESPONSE" | grep -q "received\|status"; then
    echo -e "${GREEN}✅ RFQ webhook is working${NC}"
    echo "   Response: $RFQ_RESPONSE"
else
    echo -e "${YELLOW}⚠️  RFQ webhook may not be active${NC}"
    echo "   Response: $RFQ_RESPONSE"
    echo "   Make sure the workflow is imported and activated in n8n"
fi

# Test 4: Test Marketing Automation webhook
echo "4️⃣  Testing Marketing Automation webhook..."
SUPPLIER_PAYLOAD='{
  "id": 1,
  "name": "Test Supplier",
  "mobile": "+919819049523",
  "phone": "+919819049523",
  "email": "test@example.com"
}'

SUPPLIER_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/supplier-new" \
  -H "Content-Type: application/json" \
  -d "$SUPPLIER_PAYLOAD" || echo "{}")

if echo "$SUPPLIER_RESPONSE" | grep -q "received\|status"; then
    echo -e "${GREEN}✅ Supplier webhook is working${NC}"
    echo "   Response: $SUPPLIER_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Supplier webhook may not be active${NC}"
    echo "   Response: $SUPPLIER_RESPONSE"
    echo "   Make sure the workflow is imported and activated in n8n"
fi

# Test 5: Test SHAP API directly
echo "5️⃣  Testing SHAP API directly..."
SHAP_PAYLOAD='{
  "price": 125000,
  "lead_time": 7,
  "supplier_rating": 4.8,
  "distance_km": 89,
  "past_on_time_rate": 0.97
}'

SHAP_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/ai/explain-match/1" \
  -H "Content-Type: application/json" \
  -d "$SHAP_PAYLOAD" || echo "{}")

if echo "$SHAP_RESPONSE" | grep -q "feature_importance\|model_used\|shap"; then
    echo -e "${GREEN}✅ SHAP API is working${NC}"
    echo "   Response preview: $(echo "$SHAP_RESPONSE" | head -c 100)..."
else
    echo -e "${RED}❌ SHAP API is not working${NC}"
    echo "   Response: $SHAP_RESPONSE"
    exit 1
fi

echo ""
echo "===================================="
echo -e "${GREEN}🎉 Testing Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Import workflows in n8n: backend/n8n/workflows/*.json"
echo "  2. Configure environment variables in n8n"
echo "  3. Activate workflows in n8n"
echo "  4. Test webhooks with the payloads above"
echo ""
echo "🔗 n8n Editor: $N8N_URL"
echo "🔗 API Health: $API_URL/api/health"
echo ""

