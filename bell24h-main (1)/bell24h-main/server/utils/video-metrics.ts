import client from 'prom-client';

// Initialize Prometheus metrics registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Define video-related metrics
const videoUploadsTotal = new client.Counter({
  name: 'video_uploads_total',
  help: 'Total number of video upload attempts',
  labelNames: ['plan_tier', 'result'] // result can be 'success' or 'failure'
});

const videoUploadSizeBytes = new client.Histogram({
  name: 'video_upload_size_bytes',
  help: 'Size of uploaded videos in bytes',
  labelNames: ['plan_tier'],
  buckets: [1024 * 1024, 5 * 1024 * 1024, 10 * 1024 * 1024, 50 * 1024 * 1024, 100 * 1024 * 1024] // 1MB, 5MB, 10MB, 50MB, 100MB
});

const thumbnailsGeneratedTotal = new client.Counter({
  name: 'thumbnails_generated_total',
  help: 'Total number of thumbnails generated',
  labelNames: ['plan_tier', 'result'] // result can be 'success' or 'failure'
});

const videoViewsTotal = new client.Counter({
  name: 'video_views_total',
  help: 'Total number of video views',
  labelNames: ['plan_tier', 'resource_type'] // resource_type can be 'rfq', 'product_showcase', etc.
});

const videoActivityPlayTotal = new client.Counter({
  name: 'video_activity_play_total',
  help: 'Total number of play events',
  labelNames: ['plan_tier', 'resource_type', 'duration'] // duration buckets: '0-60s', '61-180s', '181-600s', '601+'
});

const videoActivityPauseTotal = new client.Counter({
  name: 'video_activity_pause_total',
  help: 'Total number of pause events',
  labelNames: ['plan_tier', 'resource_type']
});

const videoActivityCompleteTotal = new client.Counter({
  name: 'video_activity_complete_total',
  help: 'Total number of video completion events',
  labelNames: ['plan_tier', 'resource_type', 'duration']
});

const videoActivitySeekTotal = new client.Counter({
  name: 'video_activity_seek_total',
  help: 'Total number of seek events',
  labelNames: ['plan_tier', 'resource_type']
});

const videoEngagementScore = new client.Gauge({
  name: 'video_engagement_score',
  help: 'Engagement score for videos (0-100)',
  labelNames: ['video_id', 'resource_type']
});

const videoStorageUsedBytes = new client.Gauge({
  name: 'video_storage_used_bytes',
  help: 'Current video storage used in bytes',
  labelNames: ['plan_tier']
});

const videoStorageTotalBytes = new client.Gauge({
  name: 'video_storage_total_bytes',
  help: 'Total video storage available in bytes',
  labelNames: ['plan_tier']
});

// Register all metrics
register.registerMetric(videoUploadsTotal);
register.registerMetric(videoUploadSizeBytes);
register.registerMetric(thumbnailsGeneratedTotal);
register.registerMetric(videoViewsTotal);
register.registerMetric(videoActivityPlayTotal);
register.registerMetric(videoActivityPauseTotal);
register.registerMetric(videoActivityCompleteTotal);
register.registerMetric(videoActivitySeekTotal);
register.registerMetric(videoEngagementScore);
register.registerMetric(videoStorageUsedBytes);
register.registerMetric(videoStorageTotalBytes);

// Helper functions to track various video metrics
export const trackVideoUpload = (
  planTier: string,
  sizeBytes: number,
  success: boolean
): void => {
  videoUploadsTotal.inc({ plan_tier: planTier, result: success ? 'success' : 'failure' });
  if (success) {
    videoUploadSizeBytes.observe({ plan_tier: planTier }, sizeBytes);
  }
};

export const trackThumbnailGeneration = (
  planTier: string,
  success: boolean
): void => {
  thumbnailsGeneratedTotal.inc({ plan_tier: planTier, result: success ? 'success' : 'failure' });
};

export const trackVideoView = (
  planTier: string,
  resourceType: string
): void => {
  videoViewsTotal.inc({ plan_tier: planTier, resource_type: resourceType });
};

export const trackVideoActivity = (
  planTier: string,
  resourceType: string,
  activityType: 'play' | 'pause' | 'complete' | 'seek',
  durationSeconds?: number
): void => {
  let durationBucket = '0-60s'; // Default
  
  if (durationSeconds) {
    if (durationSeconds <= 60) durationBucket = '0-60s';
    else if (durationSeconds <= 180) durationBucket = '61-180s';
    else if (durationSeconds <= 600) durationBucket = '181-600s';
    else durationBucket = '601+';
  }

  switch (activityType) {
    case 'play':
      videoActivityPlayTotal.inc({ plan_tier: planTier, resource_type: resourceType, duration: durationBucket });
      break;
    case 'pause':
      videoActivityPauseTotal.inc({ plan_tier: planTier, resource_type: resourceType });
      break;
    case 'complete':
      videoActivityCompleteTotal.inc({ plan_tier: planTier, resource_type: resourceType, duration: durationBucket });
      break;
    case 'seek':
      videoActivitySeekTotal.inc({ plan_tier: planTier, resource_type: resourceType });
      break;
  }
};

export const updateVideoEngagementScore = (
  videoId: string,
  resourceType: string,
  score: number
): void => {
  videoEngagementScore.set({ video_id: videoId, resource_type: resourceType }, score);
};

export const updateStorageUsage = (
  planTier: string,
  usedBytes: number,
  totalBytes: number
): void => {
  videoStorageUsedBytes.set({ plan_tier: planTier }, usedBytes);
  videoStorageTotalBytes.set({ plan_tier: planTier }, totalBytes);
};

// Expose metrics endpoint for Prometheus to scrape
export const getMetricsEndpoint = (): string => {
  return register.metrics();
};

export default {
  register,
  trackVideoUpload,
  trackThumbnailGeneration,
  trackVideoView,
  trackVideoActivity,
  updateVideoEngagementScore,
  updateStorageUsage,
  getMetricsEndpoint
};
