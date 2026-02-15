#!/bin/bash
# Quick Diagnostic Script for Cloudflare 521 Error
# Run this on your Oracle VM: ssh ubuntu@80.225.192.248

echo "🔍 BELL24H DIAGNOSTIC CHECK"
echo "=========================="
echo ""

echo "1️⃣ CHECKING DOCKER CONTAINERS..."
echo "-------------------------------"
docker ps
echo ""

echo "2️⃣ CHECKING NGINX STATUS..."
echo "----------------------------"
sudo systemctl status nginx --no-pager
echo ""

echo "3️⃣ CHECKING PORT 80 LISTENING..."
echo "---------------------------------"
sudo ss -ltnp | grep :80
echo ""

echo "4️⃣ TESTING BELL24H APP LOCALLY..."
echo "----------------------------------"
curl -I http://localhost:3000/api/health 2>&1 | head -5
echo ""

echo "5️⃣ TESTING N8N LOCALLY..."
echo "--------------------------"
curl -I http://localhost:5678 2>&1 | head -5
echo ""

echo "6️⃣ TESTING NGINX LOCALLY..."
echo "----------------------------"
curl -I http://localhost 2>&1 | head -5
echo ""

echo "7️⃣ CHECKING DOCKER LOGS (LAST 10 LINES)..."
echo "-------------------------------------------"
docker logs bell24h --tail 10 2>&1
echo ""

echo "8️⃣ CHECKING NGINX CONFIG..."
echo "----------------------------"
sudo nginx -t 2>&1
echo ""

echo "✅ DIAGNOSTIC COMPLETE"
echo "=========================="

