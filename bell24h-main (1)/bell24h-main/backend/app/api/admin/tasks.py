"""
Admin API for Task Management
"""
from fastapi import APIRouter, HTTPException
from app.tasks.enhancement_queue import EnhancementQueue

router = APIRouter(prefix="/api/admin/tasks", tags=["Tasks"])

queue = EnhancementQueue()

@router.get("/pending")
async def get_pending_tasks():
    """Get all pending enhancement tasks"""
    try:
        tasks = queue.get_pending_tasks(limit=50)
        count = queue.get_pending_count()
        return {
            "tasks": tasks,
            "count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

