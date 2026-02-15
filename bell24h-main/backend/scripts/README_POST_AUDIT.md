# Post-Audit Protocol - Usage Guide

## Overview

The Post-Audit Protocol automatically executes 6 critical tasks after each audit:

1. **Monitor Conversions/AB** - Tracks A/B test results and auto-switches to winner
2. **Scale Infrastructure** - Auto-scales SMS/WhatsApp capacity based on demand
3. **Clean Fake Data** - Removes all mock/spoof data, keeps only real
4. **Prioritize Bugfixes** - Tracks and prioritizes user-reported bugs
5. **Ensure Live FOMO** - Verifies real-time leaderboard and airdrop counters
6. **Migrate Enhancements** - Moves audit findings to task queue

## Quick Start

### Run Once (After Audit):
```bash
cd backend
python scripts/run_post_audit_protocol.py
```

### Run Continuously (Every 2 Hours):
```python
from app.post_audit.protocol import PostAuditProtocol
protocol = PostAuditProtocol()
protocol.run_continuous(interval_hours=2)
```

### Run Individual Steps:
```python
from app.post_audit.protocol import PostAuditProtocol
protocol = PostAuditProtocol()

# Step 1: Monitor A/B tests
protocol.monitor_conversions_ab()

# Step 2: Scale infrastructure
protocol.scale_infrastructure()

# Step 3: Clean fake data
protocol.clean_fake_data_task()

# Step 4: Prioritize bugs
protocol.prioritize_bugfixes()

# Step 5: Ensure live FOMO
protocol.ensure_live_fomo()

# Step 6: Migrate enhancements
protocol.migrate_enhancements()
```

## Configuration

### Environment Variables:
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Webhooks
N8N_WEBHOOK_AB_UPDATE=https://n8n.bell24h.com/webhook/ab-update
N8N_WEBHOOK_SCALE=https://n8n.bell24h.com/webhook/scale

# Telegram Alerts
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Dashboards

### A/B Test Dashboard:
- **URL**: `/admin/ab-test`
- **Features**: Real-time conversion rates, winner detection, auto-switch status

### Pending Tasks Dashboard:
- **URL**: `/admin/pending`
- **Features**: Task queue, priority sorting, completion tracking

## Database Setup

Run the migration:
```bash
# Apply migration
psql -U postgres -d bell24h -f supabase/migrations/20251109_post_audit_protocol.sql
```

## Monitoring

### Check Protocol Status:
```bash
# View logs
tail -f logs/post_audit_protocol.log

# Check A/B test stats
curl http://localhost:8000/api/admin/ab-test/stats

# Check pending tasks
curl http://localhost:8000/api/admin/tasks/pending
```

## Troubleshooting

### A/B Test Not Switching:
- Check if minimum samples (100) are reached
- Verify Supabase connection
- Check n8n webhook URL

### Infrastructure Not Scaling:
- Check daily usage vs threshold (80%)
- Verify cost calculations
- Check Telegram alerts configuration

### Fake Data Not Cleaning:
- Verify database permissions
- Check supplier IDs and naming conventions
- Review cleanup script logs

## Best Practices

1. **Run Protocol After Each Audit** - Ensures continuous improvement
2. **Monitor Dashboards Daily** - Track A/B test performance and task completion
3. **Review Bugs Weekly** - Prioritize and fix high-impact bugs
4. **Scale Proactively** - Monitor usage trends and scale before hitting limits
5. **Keep Data Clean** - Run cleanup script weekly to remove test data

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review database tables in Supabase
- Contact dev team via Telegram alerts

