"""
Infrastructure Scaling Automation
Uses Prisma via REST API (no Supabase needed)
"""
import os
import logging
import requests
from datetime import datetime
from typing import Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API base URL (Next.js API routes that use Prisma)
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", os.getenv("API_URL", "http://localhost:3000"))

class InfrastructureScaler:
    """Automated infrastructure scaling based on demand"""
    
    def __init__(self):
        self.current_capacity = {
            "sms_per_day": 20000,
            "whatsapp_per_day": 20000,
            "n8n_batch_size": 500,
            "total_invites_per_day": 40000
        }
        self.max_capacity = {
            "sms_per_day": 100000,
            "whatsapp_per_day": 100000,
            "n8n_batch_size": 5000,
            "total_invites_per_day": 200000
        }
        self.scale_threshold = 0.8  # Scale up when 80% capacity used
        
    def get_current_usage(self) -> Dict[str, float]:
        """Get current infrastructure usage via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/infrastructure/usage",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "sms_usage": data.get("sms_usage", 0),
                "whatsapp_usage": data.get("whatsapp_usage", 0),
                "total_usage": data.get("total_usage", 0),
                "today_count": data.get("today_count", 0)
            }
        except Exception as e:
            logger.error(f"Error getting usage: {e}")
            return {"sms_usage": 0, "whatsapp_usage": 0, "total_usage": 0, "today_count": 0}
    
    def calculate_cost(self, invites_per_day: int) -> Dict[str, float]:
        """Calculate daily cost for given invite volume"""
        # SMS: ₹0.18 per SMS (MSG91)
        # WhatsApp: ₹0.18 per message (Meta Business API)
        sms_cost_per_message = 0.18
        whatsapp_cost_per_message = 0.18
        
        # Split 50/50 between SMS and WhatsApp
        sms_count = invites_per_day // 2
        whatsapp_count = invites_per_day // 2
        
        daily_cost = (sms_count * sms_cost_per_message) + (whatsapp_count * whatsapp_cost_per_message)
        
        return {
            "daily_cost": daily_cost,
            "monthly_cost": daily_cost * 30,
            "sms_count": sms_count,
            "whatsapp_count": whatsapp_count,
            "cost_per_invite": daily_cost / invites_per_day if invites_per_day > 0 else 0
        }
    
    def should_scale_up(self, usage: Dict[str, float]) -> bool:
        """Determine if scaling is needed"""
        return usage["total_usage"] >= self.scale_threshold
    
    def scale_up(self, target_capacity: int):
        """Scale up infrastructure to target capacity"""
        try:
            # Update via API (which uses Prisma)
            response = requests.post(
                f"{API_BASE_URL}/api/admin/infrastructure/scale",
                json={
                    "sms_per_day": target_capacity // 2,
                    "whatsapp_per_day": target_capacity // 2,
                    "total_invites_per_day": target_capacity
                },
                timeout=10
            )
            response.raise_for_status()
            
            # Update n8n workflow batch size
            n8n_webhook = os.getenv("N8N_WEBHOOK_SCALE")
            if n8n_webhook:
                requests.post(n8n_webhook, json={
                    "batch_size": min(target_capacity // 100, self.max_capacity["n8n_batch_size"]),
                    "sms_per_day": target_capacity // 2,
                    "whatsapp_per_day": target_capacity // 2
                }, timeout=5)
            
            # Update local capacity
            self.current_capacity["total_invites_per_day"] = target_capacity
            self.current_capacity["sms_per_day"] = target_capacity // 2
            self.current_capacity["whatsapp_per_day"] = target_capacity // 2
            
            cost = self.calculate_cost(target_capacity)
            
            logger.info(f"✅ Scaled up to {target_capacity} invites/day (Cost: ₹{cost['daily_cost']:.2f}/day)")
            
            # Alert if cost exceeds threshold
            if cost["daily_cost"] > 10000:
                self.send_alert(f"⚠️ High daily cost: ₹{cost['daily_cost']:.2f}/day ({target_capacity} invites/day)")
            
            return True
        except Exception as e:
            logger.error(f"Error scaling up: {e}")
            return False
    
    def send_alert(self, message: str):
        """Send alert via Telegram/Slack"""
        try:
            telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
            telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
            
            if telegram_bot_token and telegram_chat_id:
                requests.post(
                    f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                    json={"chat_id": telegram_chat_id, "text": message},
                    timeout=5
                )
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def auto_scale(self):
        """Automated scaling check and execution"""
        usage = self.get_current_usage()
        
        logger.info(f"📊 Current usage: {usage['today_count']}/{self.current_capacity['total_invites_per_day']} ({usage['total_usage']:.1%})")
        
        if self.should_scale_up(usage):
            # Calculate new capacity (scale up by 50%)
            new_capacity = min(
                int(self.current_capacity["total_invites_per_day"] * 1.5),
                self.max_capacity["total_invites_per_day"]
            )
            
            if new_capacity > self.current_capacity["total_invites_per_day"]:
                logger.info(f"🚀 Scaling up to {new_capacity} invites/day")
                self.scale_up(new_capacity)
            else:
                logger.info("⚠️ At maximum capacity")
        else:
            logger.info("✅ Capacity sufficient")

if __name__ == "__main__":
    scaler = InfrastructureScaler()
    scaler.auto_scale()
