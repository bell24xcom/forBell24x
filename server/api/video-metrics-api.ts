import { Router } from 'express';
import videoMetrics from '../utils/video-metrics';
import { authenticateUser, getUserPlanTier } from '../middleware/auth';

const router = Router();

// Endpoint for Prometheus to scrape metrics
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    res.end(videoMetrics.getMetricsEndpoint());
  } catch (error) {
    console.error('Error exposing metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

// Track video upload events
router.post('/track-upload', authenticateUser, async (req, res) => {
  try {
    const { size_bytes, success, resource_type } = req.body;
    const planTier = await getUserPlanTier(req.user?.id);
    
    videoMetrics.trackVideoUpload(planTier, size_bytes, success);
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error tracking video upload:', error);
    res.status(500).json({ error: 'Failed to track video upload' });
  }
});

// Track thumbnail generation events
router.post('/track-thumbnail', authenticateUser, async (req, res) => {
  try {
    const { success, resource_type } = req.body;
    const planTier = await getUserPlanTier(req.user?.id);
    
    videoMetrics.trackThumbnailGeneration(planTier, success);
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error tracking thumbnail generation:', error);
    res.status(500).json({ error: 'Failed to track thumbnail generation' });
  }
});

// Track video activity events (play, pause, complete, seek)
router.post('/track-activity', authenticateUser, async (req, res) => {
  try {
    const { 
      resource_type, 
      activity_type, 
      video_id, 
      duration
    } = req.body;
    
    const planTier = await getUserPlanTier(req.user?.id);
    
    if (['play', 'pause', 'complete', 'seek'].includes(activity_type)) {
      videoMetrics.trackVideoActivity(
        planTier, 
        resource_type, 
        activity_type as 'play' | 'pause' | 'complete' | 'seek',
        duration
      );
      
      // Also track view on play events
      if (activity_type === 'play') {
        videoMetrics.trackVideoView(planTier, resource_type);
      }
      
      // Calculate and update engagement score on complete events
      if (activity_type === 'complete') {
        // This is a simple engagement score calculation
        // In a real implementation, you might use more factors
        const completionRatio = req.body.position / req.body.duration;
        const engagementScore = Math.round(completionRatio * 100);
        
        videoMetrics.updateVideoEngagementScore(
          video_id,
          resource_type,
          engagementScore
        );
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error tracking video activity:', error);
    res.status(500).json({ error: 'Failed to track video activity' });
  }
});

// Update storage usage metrics (can be called periodically by a cron job)
router.post('/update-storage', authenticateUser, async (req, res) => {
  try {
    const { plan_tier, used_bytes, total_bytes } = req.body;
    
    // Only allow admin users to update storage metrics
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    videoMetrics.updateStorageUsage(plan_tier, used_bytes, total_bytes);
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error updating storage metrics:', error);
    res.status(500).json({ error: 'Failed to update storage metrics' });
  }
});

export default router;
