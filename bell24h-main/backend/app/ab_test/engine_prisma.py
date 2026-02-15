"""
A/B Testing Engine using Prisma via REST API (Alternative to Supabase)
For Python backend, we'll call Next.js API endpoints that use Prisma
"""
import os
import requests
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API base URL (Next.js API routes)
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000")

class ABTestEngine:
    """A/B Testing Engine using Prisma via API"""
    
    def __init__(self):
        self.variants = {
            "variant_a": {
                "message": "Your company is LIVE on Bell24h.com — India's #1 AI B2B platform!\n\nClaim FREE → Get ₹5,000 credit + 50+ inquiries in 7 days\n\nLink: https://bell24h.com/claim/{{slug}}\n\n102 suppliers claimed today. You're next.",
                "name": "₹5,000 Credit Airdrop"
            },
            "variant_b": {
                "message": "Your company is LIVE on Bell24h.com — India's #1 AI B2B platform!\n\nClaim FREE → Get 50+ inquiries in 7 days → ₹999 one-time\n\nLink: https://bell24h.com/claim/{{slug}}\n\n102 suppliers claimed today. You're next.",
                "name": "50 Inquiries Focus"
            }
        }
        self.check_interval_hours = 2
        self.min_samples = 100
    
    def get_conversion_stats(self, hours: int = 2) -> Dict[str, float]:
        """Get conversion rates via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/ab-test/stats",
                params={"hours": hours},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return data.get("stats", {})
        except Exception as e:
            logger.error(f"Error fetching conversion stats: {e}")
            return {}
    
    def get_current_active_variant(self) -> Optional[str]:
        """Get current active variant via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/ab-test/stats",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return data.get("active_variant")
        except Exception as e:
            logger.error(f"Error getting active variant: {e}")
            return None
    
    def determine_winner(self, stats: Dict[str, float]) -> Optional[str]:
        """Determine winning variant"""
        if not stats:
            return None
        
        winner = None
        max_conversion = 0
        
        for variant_data in stats:
            variant = variant_data.get("variant")
            conversion_rate = variant_data.get("conversion_rate", 0)
            total_sent = variant_data.get("total_sent", 0)
            
            if total_sent >= self.min_samples and conversion_rate > max_conversion:
                max_conversion = conversion_rate
                winner = variant
        
        return winner
    
    def update_active_variant(self, variant: str):
        """Update active variant via API"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/admin/ab-test/update-variant",
                json={"variant": variant},
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"✅ Active variant updated to: {variant}")
        except Exception as e:
            logger.error(f"Error updating active variant: {e}")

