import time
import psutil
import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AIServiceMonitor:
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.explanation_count = 0
        self.error_count = 0
        
    def log_request(self, processing_time: float, explanation_type: str):
        """Log a successful request"""
        self.request_count += 1
        self.explanation_count += 1
        
        logger.info(f"Explanation generated: {explanation_type}, time: {processing_time:.2f}s")
        
    def log_error(self, error: str):
        """Log an error"""
        self.error_count += 1
        logger.error(f"AI service error: {error}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get service metrics"""
        uptime = time.time() - self.start_time
        memory_usage = psutil.virtual_memory().percent
        cpu_usage = psutil.cpu_percent()
        
        return {
            "uptime_seconds": uptime,
            "uptime_hours": uptime / 3600,
            "total_requests": self.request_count,
            "total_explanations": self.explanation_count,
            "error_count": self.error_count,
            "success_rate": (self.request_count - self.error_count) / max(1, self.request_count),
            "memory_usage_percent": memory_usage,
            "cpu_usage_percent": cpu_usage,
            "timestamp": datetime.now().isoformat()
        }

# Global monitor instance
monitor = AIServiceMonitor() 