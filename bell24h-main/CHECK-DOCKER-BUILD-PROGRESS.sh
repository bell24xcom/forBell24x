#!/bin/bash

echo "=========================================="
echo "🔍 CHECKING DOCKER BUILD PROGRESS"
echo "=========================================="
echo ""

# Check if Docker build process is running
echo "1️⃣ CHECKING DOCKER PROCESSES..."
echo "----------------------------------------"
ps aux | grep -E "docker.*build|docker.*daemon" | grep -v grep || echo "No active build processes found"
echo ""

# Check Docker daemon activity
echo "2️⃣ CHECKING DOCKER DAEMON STATUS..."
echo "----------------------------------------"
sudo systemctl status docker --no-pager | head -10
echo ""

# Check disk I/O (if build is copying files, there should be disk activity)
echo "3️⃣ CHECKING DISK I/O (wait 2 seconds)..."
echo "----------------------------------------"
iostat -x 1 2 2>/dev/null | tail -5 || echo "iostat not available - install with: sudo apt install sysstat"
echo ""

# Check Docker build cache
echo "4️⃣ CHECKING DOCKER BUILD CACHE..."
echo "----------------------------------------"
docker system df
echo ""

# Check if there are any error logs
echo "5️⃣ CHECKING DOCKER LOGS FOR ERRORS..."
echo "----------------------------------------"
sudo journalctl -u docker --since "5 minutes ago" --no-pager | tail -10 || echo "No recent Docker errors"
echo ""

echo "=========================================="
echo "✅ DIAGNOSTIC COMPLETE"
echo "=========================================="
echo ""
echo "📋 INTERPRETATION:"
echo "  - If you see 'docker build' in processes → Build is running"
echo "  - If disk I/O shows activity → Files are being copied"
echo "  - If no errors in logs → Build is healthy"
echo ""
echo "💡 TIP: The COPY . . step can take 2-5 minutes with 905MB context"
echo "   This is NORMAL - be patient!"
echo ""
