"""
Enhancement Task Queue and Migration System
Uses Prisma via REST API (no Supabase needed)
"""
import os
import requests
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API base URL (Next.js API routes that use Prisma)
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", os.getenv("API_URL", "http://localhost:3000"))

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class EnhancementQueue:
    """Enhancement task queue management using Prisma via API"""
    
    def __init__(self):
        self.priority_weights = {
            TaskPriority.CRITICAL: 10,
            TaskPriority.HIGH: 5,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 1
        }
    
    def add_enhancement(self, title: str, description: str, priority: TaskPriority,
                       category: str, estimated_hours: Optional[int] = None) -> str:
        """Add enhancement to queue via API"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/admin/tasks/add",
                json={
                    "title": title,
                    "description": description,
                    "priority": priority.value,
                    "category": category,
                    "estimated_hours": estimated_hours
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            task_id = data.get("id")
            
            logger.info(f"📋 Enhancement added: {title} (Priority: {priority.value})")
            return task_id
        except Exception as e:
            logger.error(f"Error adding enhancement: {e}")
            return None
    
    def get_pending_tasks(self, limit: int = 50) -> List[Dict]:
        """Get all pending enhancement tasks via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/tasks/pending",
                params={"limit": limit},
                timeout=10
            )
            response.raise_for_status()
            return response.json().get("tasks", [])
        except Exception as e:
            logger.error(f"Error getting pending tasks: {e}")
            return []
    
    def get_tasks_by_category(self, category: str) -> List[Dict]:
        """Get tasks by category via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/tasks",
                params={"category": category, "status": TaskStatus.PENDING.value},
                timeout=10
            )
            response.raise_for_status()
            return response.json().get("tasks", [])
        except Exception as e:
            logger.error(f"Error getting tasks by category: {e}")
            return []
    
    def mark_in_progress(self, task_id: str, assigned_to: str):
        """Mark task as in progress via API"""
        try:
            response = requests.patch(
                f"{API_BASE_URL}/api/admin/tasks/{task_id}/status",
                json={"status": TaskStatus.IN_PROGRESS.value, "assigned_to": assigned_to},
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"🔧 Task {task_id} marked as in progress")
        except Exception as e:
            logger.error(f"Error updating task: {e}")
    
    def mark_completed(self, task_id: str, completion_notes: Optional[str] = None):
        """Mark task as completed via API"""
        try:
            response = requests.patch(
                f"{API_BASE_URL}/api/admin/tasks/{task_id}/status",
                json={"status": TaskStatus.COMPLETED.value, "completion_notes": completion_notes},
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"✅ Task {task_id} marked as completed")
        except Exception as e:
            logger.error(f"Error updating task: {e}")
    
    def get_pending_count(self) -> int:
        """Get count of pending tasks via API"""
        try:
            response = requests.get(
                f"{API_BASE_URL}/api/admin/tasks/pending-count",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return data.get("count", 0)
        except Exception as e:
            logger.error(f"Error getting pending count: {e}")
            return 0
    
    def migrate_from_audit(self, audit_findings: List[Dict]):
        """Migrate audit findings to enhancement tasks"""
        for finding in audit_findings:
            self.add_enhancement(
                title=finding.get("title"),
                description=finding.get("description"),
                priority=TaskPriority(finding.get("priority", "medium")),
                category=finding.get("category", "general"),
                estimated_hours=finding.get("estimated_hours")
            )

# Common enhancements from post-audit protocol
POST_AUDIT_ENHANCEMENTS = [
    {
        "title": "Mobile PWA + Push Notifications",
        "description": "Implement PWA with service worker and Firebase push notifications",
        "priority": TaskPriority.HIGH,
        "category": "mobile",
        "estimated_hours": 8
    },
    {
        "title": "Dynamic Gamification - Supplier Olympics",
        "description": "Weekly prizes, streak badges, leaderboard competitions",
        "priority": TaskPriority.MEDIUM,
        "category": "gamification",
        "estimated_hours": 12
    },
    {
        "title": "Deeper Data Science Cohorts",
        "description": "Conversion analysis by state/city/product, best time to submit RFQ",
        "priority": TaskPriority.MEDIUM,
        "category": "analytics",
        "estimated_hours": 6
    },
    {
        "title": "Governance Dashboard",
        "description": "BELL token holders vote on pricing changes and platform decisions",
        "priority": TaskPriority.LOW,
        "category": "governance",
        "estimated_hours": 10
    },
    {
        "title": "API Docs + Affiliate System",
        "description": "OpenAPI docs and affiliate referral system with ₹500 per paid claim",
        "priority": TaskPriority.HIGH,
        "category": "api",
        "estimated_hours": 8
    },
    {
        "title": "Concierge Support + AI Chatbot",
        "description": "WhatsApp Business API with Groq + Llama3 for AI replies, top 100 get personal manager",
        "priority": TaskPriority.MEDIUM,
        "category": "support",
        "estimated_hours": 12
    }
]

def initialize_post_audit_enhancements():
    """Initialize post-audit enhancements"""
    queue = EnhancementQueue()
    for enhancement in POST_AUDIT_ENHANCEMENTS:
        queue.add_enhancement(
            enhancement["title"],
            enhancement["description"],
            enhancement["priority"],
            enhancement["category"],
            enhancement["estimated_hours"]
        )

if __name__ == "__main__":
    queue = EnhancementQueue()
    
    # Get pending count
    pending_count = queue.get_pending_count()
    print(f"📋 Pending enhancements: {pending_count}")
    
    # Get pending tasks
    pending_tasks = queue.get_pending_tasks(limit=10)
    print(f"\n🔍 Top {len(pending_tasks)} pending tasks:")
    for task in pending_tasks:
        print(f"  - {task['title']} (Priority: {task['priority']}, Category: {task['category']})")
