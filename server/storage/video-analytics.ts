import { db } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface VideoActivity {
  id: string;
  video_id: string;
  user_id: string;
  activity_type: string;
  resource_type?: string;
  resource_id?: string;
  position?: number;
  duration?: number;
  device_info?: string;
  ip_address?: string;
  metadata?: string;
  created_at: Date;
}

interface VideoStreamingInfo {
  hls_url: string;
  dash_url: string;
  updated_at: Date;
}

/**
 * Track video activity such as play, pause, complete, progress events
 */
export async function trackVideoActivity(activity: Partial<VideoActivity>) {
  // Generate ID if not provided
  if (!activity.id) {
    activity.id = uuidv4();
  }
  
  // Set created_at if not provided
  if (!activity.created_at) {
    activity.created_at = new Date();
  }
  
  await db.execute(sql`
    INSERT INTO video_activity (
      id, video_id, user_id, activity_type, resource_type, resource_id,
      position, duration, device_info, ip_address, metadata, created_at
    ) VALUES (
      ${activity.id},
      ${activity.video_id},
      ${activity.user_id},
      ${activity.activity_type},
      ${activity.resource_type || null},
      ${activity.resource_id || null},
      ${activity.position || null},
      ${activity.duration || null},
      ${activity.device_info || null},
      ${activity.ip_address || null},
      ${activity.metadata || null},
      ${activity.created_at}
    )
  `);
  
  // If this is a view event (first view), increment the view count
  if (activity.activity_type === 'view' || activity.activity_type === 'play') {
    await incrementVideoViewCount(activity.video_id);
  }
  
  return activity;
}

/**
 * Increment the view count for a video
 */
async function incrementVideoViewCount(videoId: string) {
  // Check if the video exists in the video_stats table
  const existingStats = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count FROM video_stats WHERE video_id = ${videoId}
  `);
  
  if (existingStats[0]?.count > 0) {
    // Update existing stats
    await db.execute(sql`
      UPDATE video_stats
      SET view_count = view_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE video_id = ${videoId}
    `);
  } else {
    // Create new stats record
    await db.execute(sql`
      INSERT INTO video_stats (
        video_id, view_count, created_at, updated_at
      ) VALUES (
        ${videoId}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
  }
}

/**
 * Get analytics data for a specific video
 */
export async function getVideoAnalytics(videoId: string) {
  // Get activity breakdown
  const activityBreakdown = await db.execute<{
    activity_type: string;
    count: number;
    avg_position: number;
  }>(sql`
    SELECT 
      activity_type, 
      COUNT(*) as count,
      AVG(position) as avg_position
    FROM video_activity
    WHERE video_id = ${videoId}
    GROUP BY activity_type
    ORDER BY count DESC
  `);
  
  // Get view count
  const viewCount = await getVideoViewCount(videoId);
  
  // Get engagement metrics
  const engagementMetrics = await getVideoEngagementMetrics(videoId);
  
  // Get device breakdown
  const deviceBreakdown = await getVideoDeviceBreakdown(videoId);
  
  // Get resource type breakdown (e.g., rfq vs product showcase)
  const resourceTypeBreakdown = await db.execute<{
    resource_type: string;
    count: number;
  }>(sql`
    SELECT 
      resource_type, 
      COUNT(*) as count
    FROM video_activity
    WHERE video_id = ${videoId} AND resource_type IS NOT NULL
    GROUP BY resource_type
    ORDER BY count DESC
  `);
  
  return {
    activityBreakdown,
    viewCount,
    engagementMetrics,
    deviceBreakdown,
    resourceTypeBreakdown
  };
}

/**
 * Get total view count for a video
 */
export async function getVideoViewCount(videoId: string) {
  const result = await db.execute<{ view_count: number }>(sql`
    SELECT view_count FROM video_stats
    WHERE video_id = ${videoId}
  `);
  
  return result[0]?.view_count || 0;
}

/**
 * Get engagement metrics for a video (completion rate, avg watch time)
 */
export async function getVideoEngagementMetrics(videoId: string) {
  // Get total plays/views
  const playCount = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count
    FROM video_activity
    WHERE video_id = ${videoId} AND (activity_type = 'play' OR activity_type = 'view')
  `);
  
  // Get total completes
  const completeCount = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count
    FROM video_activity
    WHERE video_id = ${videoId} AND activity_type = 'complete'
  `);
  
  // Get average watch position (as percentage of total duration)
  const avgWatchTime = await db.execute<{ avg_watch_time: number }>(sql`
    SELECT AVG(position / NULLIF(duration, 0) * 100) as avg_watch_time
    FROM video_activity
    WHERE video_id = ${videoId} AND duration > 0
  `);
  
  // Get 25%, 50%, 75%, 100% watch markers
  const watchMarkers = await db.execute<{ 
    quarter: number;
    half: number;
    threequarters: number;
    full: number;
  }>(sql`
    SELECT 
      SUM(CASE WHEN position/NULLIF(duration, 0) >= 0.25 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as quarter,
      SUM(CASE WHEN position/NULLIF(duration, 0) >= 0.5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as half,
      SUM(CASE WHEN position/NULLIF(duration, 0) >= 0.75 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as threequarters,
      SUM(CASE WHEN position/NULLIF(duration, 0) >= 0.95 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as full
    FROM video_activity
    WHERE video_id = ${videoId} AND duration > 0 AND (activity_type = 'play' OR activity_type = 'progress')
  `);
  
  // Calculate completion rate
  const totalPlays = playCount[0]?.count || 0;
  const totalCompletes = completeCount[0]?.count || 0;
  const completionRate = totalPlays > 0 ? (totalCompletes / totalPlays) * 100 : 0;
  
  return {
    totalPlays,
    totalCompletes,
    completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
    averageWatchPercentage: Math.round((avgWatchTime[0]?.avg_watch_time || 0) * 100) / 100,
    retentionCurve: {
      quarter: Math.round((watchMarkers[0]?.quarter || 0) * 100) / 100,
      half: Math.round((watchMarkers[0]?.half || 0) * 100) / 100,
      threeQuarters: Math.round((watchMarkers[0]?.threequarters || 0) * 100) / 100,
      full: Math.round((watchMarkers[0]?.full || 0) * 100) / 100
    }
  };
}

/**
 * Get device breakdown for video views
 */
export async function getVideoDeviceBreakdown(videoId: string) {
  const results = await db.execute<{
    device_type: string;
    count: number;
    percentage: number;
  }>(sql`
    WITH device_counts AS (
      SELECT
        CASE
          WHEN device_info LIKE '%Android%' THEN 'Android'
          WHEN device_info LIKE '%iPhone%' OR device_info LIKE '%iPad%' OR device_info LIKE '%iPod%' THEN 'iOS'
          WHEN device_info LIKE '%Windows%' THEN 'Windows'
          WHEN device_info LIKE '%Mac%' THEN 'Mac'
          WHEN device_info LIKE '%Linux%' THEN 'Linux'
          ELSE 'Other'
        END AS device_type,
        COUNT(*) as count
      FROM video_activity
      WHERE video_id = ${videoId} AND (activity_type = 'play' OR activity_type = 'view')
      GROUP BY device_type
    ),
    total_views AS (
      SELECT SUM(count) as total
      FROM device_counts
    )
    SELECT
      device_type,
      count,
      ROUND((count * 100.0 / NULLIF((SELECT total FROM total_views), 0)), 2) as percentage
    FROM device_counts
    ORDER BY count DESC
  `);
  
  return results;
}

/**
 * Update streaming URLs for a video
 */
export async function updateVideoStreaming(videoId: string, info: VideoStreamingInfo) {
  const existingInfo = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count FROM video_streaming
    WHERE video_id = ${videoId}
  `);
  
  if (existingInfo[0]?.count > 0) {
    // Update existing record
    await db.execute(sql`
      UPDATE video_streaming
      SET 
        hls_url = ${info.hls_url},
        dash_url = ${info.dash_url},
        updated_at = ${info.updated_at}
      WHERE video_id = ${videoId}
    `);
  } else {
    // Create new record
    await db.execute(sql`
      INSERT INTO video_streaming (
        video_id, hls_url, dash_url, created_at, updated_at
      ) VALUES (
        ${videoId}, ${info.hls_url}, ${info.dash_url}, ${info.updated_at}, ${info.updated_at}
      )
    `);
  }
  
  return {
    video_id: videoId,
    ...info
  };
}

/**
 * Get streaming URLs for a video
 */
export async function getVideoStreamingUrls(videoId: string) {
  const result = await db.execute<{
    hls_url: string;
    dash_url: string;
  }>(sql`
    SELECT hls_url, dash_url
    FROM video_streaming
    WHERE video_id = ${videoId}
  `);
  
  return result[0] || null;
}

/**
 * Store video analytics metrics from Cloudinary or other platforms
 */
export async function storeVideoAnalytics(data: {
  public_id: string;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  size_bytes?: number;
  tags?: string[];
  created_at: Date;
}) {
  const existingMetrics = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count 
    FROM video_metrics 
    WHERE public_id = ${data.public_id}
  `);
  
  if (existingMetrics[0]?.count > 0) {
    // Update existing metrics
    await db.execute(sql`
      UPDATE video_metrics
      SET 
        duration = ${data.duration || 0},
        width = ${data.width || 0},
        height = ${data.height || 0},
        format = ${data.format || 'unknown'},
        size_bytes = ${data.size_bytes || 0},
        tags = ${data.tags ? JSON.stringify(data.tags) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE public_id = ${data.public_id}
    `);
  } else {
    // Create new metrics record
    await db.execute(sql`
      INSERT INTO video_metrics (
        public_id, duration, width, height, format, size_bytes, tags, created_at, updated_at
      ) VALUES (
        ${data.public_id},
        ${data.duration || 0},
        ${data.width || 0},
        ${data.height || 0},
        ${data.format || 'unknown'},
        ${data.size_bytes || 0},
        ${data.tags ? JSON.stringify(data.tags) : null},
        ${data.created_at},
        ${data.created_at}
      )
    `);
  }
  
  return data;
}

/**
 * Get analytics for videos by resource type (e.g., all product showcase videos)
 */
export async function getVideoAnalyticsByResourceType(resourceType: string, limit: number = 10) {
  // Get the most viewed videos of this resource type
  const topVideos = await db.execute(sql`
    SELECT 
      v.video_id,
      v.resource_id,
      COUNT(*) as view_count,
      MAX(v.created_at) as last_viewed
    FROM video_activity v
    WHERE v.resource_type = ${resourceType}
    AND (v.activity_type = 'view' OR v.activity_type = 'play')
    GROUP BY v.video_id, v.resource_id
    ORDER BY view_count DESC, last_viewed DESC
    LIMIT ${limit}
  `);
  
  // For each video, get full analytics
  const results = [];
  for (const video of topVideos) {
    const analytics = await getVideoAnalytics(video.video_id);
    results.push({
      video_id: video.video_id,
      resource_id: video.resource_id,
      view_count: video.view_count,
      last_viewed: video.last_viewed,
      analytics
    });
  }
  
  return results;
}
