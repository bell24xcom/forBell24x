"""
Clean Fake Data Script
Uses Prisma via REST API (no Supabase needed)
"""
import os
import sys
import requests
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# API base URL (Next.js API routes that use Prisma)
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", os.getenv("API_URL", "http://localhost:3000"))

def clean_fake_suppliers():
    """Remove fake suppliers via API"""
    print("🧹 Cleaning fake suppliers...")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/cleanup/fake-suppliers",
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        deleted_count = data.get("deleted_count", 0)
        print(f"✅ Deleted {deleted_count} fake suppliers")
        return deleted_count
    except Exception as e:
        print(f"❌ Error cleaning fake suppliers: {e}")
        return 0

def clean_fake_earnings():
    """Remove fake earnings from leaderboard via API"""
    print("🧹 Cleaning fake earnings...")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/cleanup/fake-earnings",
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        deleted_count = data.get("deleted_count", 0)
        print(f"✅ Deleted {deleted_count} fake earnings")
        return deleted_count
    except Exception as e:
        print(f"❌ Error cleaning fake earnings: {e}")
        return 0

def verify_real_claims():
    """Verify and count real claims via API"""
    print("🔍 Verifying real claims...")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/admin/claims/real-count",
            params={"days": 30},
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        real_claims = data.get("count", 0)
        print(f"✅ Found {real_claims} real verified claims in last 30 days")
        return real_claims
    except Exception as e:
        print(f"❌ Error verifying claims: {e}")
        return 0

def update_leaderboard_with_real_data():
    """Update leaderboard with only real earnings via API"""
    print("📊 Updating leaderboard with real data...")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/admin/leaderboard/update-real",
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        real_suppliers = data.get("supplier_count", 0)
        print(f"✅ Leaderboard updated with {real_suppliers} real suppliers")
        return real_suppliers
    except Exception as e:
        print(f"❌ Error updating leaderboard: {e}")
        return 0

def main():
    """Main cleanup function"""
    print("🚀 Starting fake data cleanup...")
    print("=" * 50)
    
    # Clean fake suppliers
    fake_suppliers = clean_fake_suppliers()
    
    # Clean fake earnings
    fake_earnings = clean_fake_earnings()
    
    # Verify real claims
    real_claims = verify_real_claims()
    
    # Update leaderboard
    real_suppliers = update_leaderboard_with_real_data()
    
    print("=" * 50)
    print("✅ Cleanup complete!")
    print(f"  - Deleted {fake_suppliers} fake suppliers")
    print(f"  - Deleted {fake_earnings} fake earnings")
    print(f"  - Verified {real_claims} real claims")
    print(f"  - Updated leaderboard with {real_suppliers} real suppliers")

if __name__ == "__main__":
    main()
