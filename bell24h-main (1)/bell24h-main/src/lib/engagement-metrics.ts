import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EngagementMetrics {
  // 24-Hour Metrics
  newRegistrations: number;
  activeUsers: number;
  completedOnboarding: number;
  firstRFQCreated: number;
  firstProductUploaded: number;
  firstTransaction: number;
  
  // Engagement Scores
  sessionDuration: number;
  pageViews: number;
  featureAdoption: {
    rfqCreation: number;
    productUpload: number;
    aiFeatures: number;
    trafficPricing: number;
  };
  
  // Conversion Metrics
  registrationToOnboarding: number;
  onboardingToFirstAction: number;
  firstActionToTransaction: number;
  
  // Retention Indicators
  returnVisits: number;
  featureUsage: number;
  feedbackSubmitted: number;
}

interface UserJourney {
  userId: string;
  registrationTime: Date;
  onboardingSteps: string[];
  firstAction: string;
  firstActionTime: Date;
  sessionCount: number;
  totalSessionTime: number;
  featuresUsed: string[];
  lastActive: Date;
}

export const track24HourEngagement = async (): Promise<EngagementMetrics> => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  try {
    // 1. New Registrations (Last 24 hours)
    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // 2. Active Users (Users who logged in within 24 hours)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // 3. Completed Onboarding (Users who completed all onboarding steps)
    const completedOnboarding = await prisma.user.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        },
        onboardingCompleted: true
      }
    });

    // 4. First RFQ Created
    const firstRFQCreated = await prisma.rFQ.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // 5. First Product Uploaded
    const firstProductUploaded = await prisma.product.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // 6. First Transaction (mock data)
    const firstTransaction = 0; // Mock: no transactions in last 24 hours

    // 7. Session Duration (Average)
    const sessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      include: {
        user: true
      }
    });

    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, session) => {
          const duration = session.lastActivity 
            ? new Date(session.lastActivity).getTime() - new Date(session.createdAt).getTime()
            : 0;
          return sum + duration;
        }, 0) / sessions.length / (1000 * 60) // Convert to minutes
      : 0;

    // 8. Page Views
    const pageViews = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    // 9. Feature Adoption
    const featureAdoption = {
      rfqCreation: await prisma.rFQ.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        }
      }),
      productUpload: await prisma.product.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        }
      }),
      aiFeatures: await prisma.trafficAnalytics.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          },
          aiFeaturesUsed: {
            not: null
          }
        }
      }),
      trafficPricing: await prisma.trafficAnalytics.count({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo
          },
          trafficPricingEnabled: true
        }
      })
    };

    // 10. Conversion Rates
    const totalRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    const registrationToOnboarding = totalRegistrations > 0 
      ? (completedOnboarding / totalRegistrations) * 100 
      : 0;

    const onboardingToFirstAction = completedOnboarding > 0 
      ? ((firstRFQCreated + firstProductUploaded) / completedOnboarding) * 100 
      : 0;

    const firstActionToTransaction = (firstRFQCreated + firstProductUploaded) > 0 
      ? (firstTransaction / (firstRFQCreated + firstProductUploaded)) * 100 
      : 0;

    // 11. Return Visits
    const returnVisits = await prisma.session.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        },
        user: {
          sessionCount: {
            gt: 1
          }
        }
      }
    });

    // 12. Feature Usage
    const featureUsage = await prisma.user.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        },
        OR: [
          { rfqs: { some: {} } },
          { products: { some: {} } },
          { trafficAnalytics: { some: {} } }
        ]
      }
    });

    // 13. Feedback Submitted
    const feedbackSubmitted = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    });

    return {
      newRegistrations,
      activeUsers,
      completedOnboarding,
      firstRFQCreated,
      firstProductUploaded,
      firstTransaction,
      sessionDuration: avgSessionDuration,
      pageViews,
      featureAdoption,
      registrationToOnboarding,
      onboardingToFirstAction,
      firstActionToTransaction,
      returnVisits,
      featureUsage,
      feedbackSubmitted
    };

  } catch (error) {
    console.error('Failed to track 24-hour engagement:', error);
    throw new Error('Failed to calculate engagement metrics');
  }
};

export const trackUserJourney = async (userId: string): Promise<UserJourney> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rfqs: true,
        products: true,
        sessions: true,
        trafficAnalytics: true,
        feedback: true
      }
    });

    if (!user) throw new Error('User not found');

    // Calculate onboarding steps completed
    const onboardingSteps = [];
    if (user.profileCompleted) onboardingSteps.push('profile');
    if (user.kycVerified) onboardingSteps.push('kyc');
    if (user.firstProductUploaded) onboardingSteps.push('product_upload');
    if (user.firstRFQCreated) onboardingSteps.push('rfq_creation');

    // Determine first action
    let firstAction = 'none';
    let firstActionTime = user.createdAt;

    if (user.rfqs.length > 0) {
      const firstRFQ = user.rfqs.reduce((earliest, rfq) => 
        new Date(rfq.createdAt) < new Date(earliest.createdAt) ? rfq : earliest
      );
      if (new Date(firstRFQ.createdAt) < firstActionTime) {
        firstAction = 'rfq_creation';
        firstActionTime = firstRFQ.createdAt;
      }
    }

    if (user.products.length > 0) {
      const firstProduct = user.products.reduce((earliest, product) => 
        new Date(product.createdAt) < new Date(earliest.createdAt) ? product : earliest
      );
      if (new Date(firstProduct.createdAt) < firstActionTime) {
        firstAction = 'product_upload';
        firstActionTime = firstProduct.createdAt;
      }
    }

    // Calculate session metrics
    const sessionCount = user.sessions.length;
    const totalSessionTime = user.sessions.reduce((total, session) => {
      const duration = session.lastActivity 
        ? new Date(session.lastActivity).getTime() - new Date(session.createdAt).getTime()
        : 0;
      return total + duration;
    }, 0);

    // Determine features used
    const featuresUsed = [];
    if (user.rfqs.length > 0) featuresUsed.push('rfq_creation');
    if (user.products.length > 0) featuresUsed.push('product_upload');
    if (user.trafficAnalytics.length > 0) featuresUsed.push('traffic_analytics');
    if (user.feedback.length > 0) featuresUsed.push('feedback');

    // Find last active time
    const lastActive = user.sessions.length > 0 
      ? user.sessions.reduce((latest, session) => 
          new Date(session.lastActivity || session.createdAt) > new Date(latest) 
            ? session.lastActivity || session.createdAt 
            : latest
        )
      : user.createdAt;

    return {
      userId: user.id,
      registrationTime: user.createdAt,
      onboardingSteps,
      firstAction,
      firstActionTime,
      sessionCount,
      totalSessionTime,
      featuresUsed,
      lastActive
    };

  } catch (error) {
    console.error('Failed to track user journey:', error);
    throw new Error('Failed to calculate user journey');
  }
};

export const generateEngagementReport = async () => {
  const metrics = await track24HourEngagement();
  
  // Calculate engagement score (0-100)
  const engagementScore = calculateEngagementScore(metrics);
  
  // Generate insights
  const insights = generateInsights(metrics);
  
  // Predict retention
  const retentionPrediction = predictRetention(metrics);
  
  return {
    metrics,
    engagementScore,
    insights,
    retentionPrediction,
    recommendations: generateRecommendations(metrics, insights)
  };
};

const calculateEngagementScore = (metrics: EngagementMetrics): number => {
  const factors = [
    metrics.registrationToOnboarding * 0.2, // 20% weight
    metrics.onboardingToFirstAction * 0.3,  // 30% weight
    metrics.firstActionToTransaction * 0.2,  // 20% weight
    Math.min(metrics.sessionDuration / 10, 1) * 100 * 0.15, // 15% weight (max 10 min = 100%)
    Math.min(metrics.pageViews / 10, 1) * 100 * 0.15  // 15% weight (max 10 page views = 100%)
  ];
  
  return Math.min(100, factors.reduce((sum, factor) => sum + factor, 0));
};

const generateInsights = (metrics: EngagementMetrics) => {
  const insights = [];
  
  if (metrics.registrationToOnboarding < 50) {
    insights.push('Low onboarding completion rate - consider simplifying the process');
  }
  
  if (metrics.onboardingToFirstAction < 30) {
    insights.push('Users not taking first action after onboarding - add more guidance');
  }
  
  if (metrics.sessionDuration < 5) {
    insights.push('Short session duration - improve user experience and feature discovery');
  }
  
  if (metrics.returnVisits < metrics.newRegistrations * 0.3) {
    insights.push('Low return visit rate - implement re-engagement strategies');
  }
  
  if (metrics.featureUsage < metrics.newRegistrations * 0.2) {
    insights.push('Low feature adoption - highlight key features during onboarding');
  }
  
  return insights;
};

const predictRetention = (metrics: EngagementMetrics) => {
  const factors = [
    metrics.engagementScore / 100,
    metrics.returnVisits / Math.max(metrics.newRegistrations, 1),
    metrics.featureUsage / Math.max(metrics.newRegistrations, 1),
    metrics.feedbackSubmitted / Math.max(metrics.newRegistrations, 1)
  ];
  
  const avgFactor = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  const retentionProbability = avgFactor * 100;
  
  return {
    probability: Math.min(100, retentionProbability),
    confidence: 'medium',
    factors: factors
  };
};

const generateRecommendations = (metrics: EngagementMetrics, insights: string[]) => {
  const recommendations = [];
  
  if (metrics.registrationToOnboarding < 50) {
    recommendations.push('Implement progressive onboarding with clear progress indicators');
    recommendations.push('Add welcome video or interactive tutorial');
  }
  
  if (metrics.onboardingToFirstAction < 30) {
    recommendations.push('Add guided first action with AI assistance');
    recommendations.push('Implement gamification with points for first actions');
  }
  
  if (metrics.sessionDuration < 5) {
    recommendations.push('Optimize page load times and improve mobile experience');
    recommendations.push('Add engaging content and feature highlights');
  }
  
  if (metrics.returnVisits < metrics.newRegistrations * 0.3) {
    recommendations.push('Implement email re-engagement campaigns');
    recommendations.push('Add push notifications for new features');
  }
  
  return recommendations;
};

export const trackRealTimeEngagement = async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const realTimeMetrics = {
    activeUsers: await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneHourAgo
        }
      }
    }),
    newRegistrations: await prisma.user.count({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      }
    }),
    rfqsCreated: await prisma.rFQ.count({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      }
    }),
    productsUploaded: await prisma.product.count({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      }
    })
  };
  
  return realTimeMetrics;
}; 
