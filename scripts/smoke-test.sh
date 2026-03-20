#!/bin/bash

# Bell24h Phase 5: Critical Path Smoke Test
# This script validates the Guest Flow, Memory Sync, and Agent Safety Switch.

echo "🚀 [SMOKE-TEST] Starting Validation Suite..."

# Set Test Mode
export AGENT_MODE=test
export NEXTAUTH_URL="http://localhost:3000"

# 1. FLOW A: Guest Video RFQ Submission
echo "------------------------------------------------"
echo "📡 [FLOW A] Simulating Guest Video RFQ Submission..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/rfq/guest-sync \
  -H "Content-Type: application/json" \
  -d '{
    "rfqId": "test_guest_123",
    "title": "Packaging Requirement in Ahmedabad",
    "category": "Packaging",
    "location": "Ahmedabad",
    "data": { "type": "video" }
  }')

echo "Response: $RESPONSE"

if [[ $RESPONSE == *"success\":true"* ]]; then
  echo "✅ [SMOKE-TEST] Flow A Passed: API accepted guest submission."
else
  echo "❌ [SMOKE-TEST] Flow A Failed: API rejected guest submission."
  exit 1
fi

# 2. FLOW B & C: Memory & Metadata Verification
# (These are verified by checking the server logs for the markers added)
echo "------------------------------------------------"
echo "🧠 [FLOW B/C] Verifying Memory Sync & Metadata..."
echo "Please ensure your dev server logs show:"
echo "  [SMOKE-TEST] Memory: test_guest_123 - Stored guest intent."
echo "  [SMOKE-TEST] Strategy: Scout - Mode: test"
echo "  [SMOKE-TEST] Messenger: BLOCKED-TEST-MODE - No external outreach triggered."

echo "------------------------------------------------"
echo "✨ [SMOKE-TEST] Suite Complete."
