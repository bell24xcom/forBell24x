import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * GET /api/voice-rfq/analytics
 * Retrieve analytics data for voice-based RFQs
 */
router.get('/voice-rfq/analytics', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get query parameters
    const timeRange = req.query.timeRange as string || '30d'; // 7d, 30d, 90d, all
    const language = req.query.language as string || 'all';

    // Calculate the date range based on timeRange
    const now = new Date();
    let startDate: Date | null = null;
    
    if (timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Get all RFQs with voice metadata
    const allRfqs = await storage.getAllRFQs();
    
    // Filter RFQs that have voice metadata and match the time range and language filter
    const voiceRfqs = allRfqs.filter(rfq => {
      // Check for voice metadata
      const hasVoiceMetadata = rfq.metadata && 
        (rfq.metadata.detected_language || rfq.metadata.original_text);
      
      if (!hasVoiceMetadata) return false;
      
      // Apply time range filter
      if (startDate && new Date(rfq.created_at) < startDate) return false;
      
      // Apply language filter
      if (language !== 'all' && rfq.metadata.detected_language !== language) return false;
      
      return true;
    });

    // Calculate analytics metrics
    const totalRfqs = voiceRfqs.length;
    
    // Count unique languages
    const languages = voiceRfqs.map(rfq => rfq.metadata.detected_language || 'unknown');
    const uniqueLanguages = new Set(languages).size;
    
    // Calculate language distribution
    const languageCount: Record<string, number> = {};
    languages.forEach(lang => {
      languageCount[lang] = (languageCount[lang] || 0) + 1;
    });
    
    const languageDistribution = Object.entries(languageCount).map(([lang, count]) => ({
      name: getLanguageName(lang),
      value: count
    }));
    
    // Find most used language
    let mostUsedLanguage = 'en';
    let maxCount = 0;
    
    Object.entries(languageCount).forEach(([lang, count]) => {
      if (count > maxCount) {
        mostUsedLanguage = lang;
        maxCount = count;
      }
    });
    
    // Calculate translation rate
    const translatedCount = voiceRfqs.filter(rfq => rfq.metadata.has_translation).length;
    const translationRate = totalRfqs > 0 ? translatedCount / totalRfqs : 0;
    
    // Calculate average confidence (mocked for now)
    const averageConfidence = 0.87;
    
    // Calculate enhancement rate (mocked for now)
    const enhancementRate = 0.35;
    
    // Calculate success rate (mocked for now)
    const successRate = 0.92;
    
    // Calculate RFQ submission trend
    const voiceRfqTrend = calculateSubmissionTrend(voiceRfqs, timeRange);
    
    // Get latest RFQs
    const latestRfqs = voiceRfqs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    // Construct response
    const response = {
      totalRfqs,
      uniqueLanguages,
      mostUsedLanguage,
      languageDistribution,
      voiceRfqTrend,
      qualityMetrics: {
        averageConfidence,
        enhancementRate,
        translationRate,
        successRate
      },
      latestRfqs
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching voice analytics:', error);
    res.status(500).json({ error: 'Failed to fetch voice analytics data' });
  }
});

/**
 * Helper function to get language name from language code
 */
function getLanguageName(langCode: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'unknown': 'Unknown'
  };
  
  return languageNames[langCode] || langCode;
}

/**
 * Helper function to calculate submission trend based on time range
 */
function calculateSubmissionTrend(rfqs: any[], timeRange: string) {
  // Sort RFQs by creation date
  const sortedRfqs = [...rfqs].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  if (sortedRfqs.length === 0) {
    return [];
  }
  
  // Determine interval based on time range
  let interval: 'day' | 'week' | 'month' = 'day';
  if (timeRange === '90d') {
    interval = 'week';
  } else if (timeRange === 'all' && sortedRfqs.length > 0) {
    const firstDate = new Date(sortedRfqs[0].created_at);
    const lastDate = new Date(sortedRfqs[sortedRfqs.length - 1].created_at);
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 180) {
      interval = 'month';
    } else if (daysDiff > 30) {
      interval = 'week';
    }
  }
  
  // Group RFQs by interval
  const countByInterval: Record<string, number> = {};
  
  sortedRfqs.forEach(rfq => {
    const date = new Date(rfq.created_at);
    let key: string;
    
    if (interval === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (interval === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      key = weekStart.toISOString().split('T')[0];
    } else { // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    countByInterval[key] = (countByInterval[key] || 0) + 1;
  });
  
  // Convert to array format for charts
  return Object.entries(countByInterval).map(([date, count]) => ({
    date,
    count
  }));
}

export default router;