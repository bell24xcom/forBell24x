import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { rfqId, category, location, budget, urgency, requirements } = await req.json();

    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }

    // Get RFQ details
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // Build matching criteria
    const where: any = {
      role: 'SUPPLIER',
      isActive: true,
      verified: true
    };

    // Category matching (exact or related)
    if (category) {
      where.OR = [
        { category: category },
        { category: { contains: category, mode: 'insensitive' } }
      ];
    }

    // Location matching (exact or nearby)
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Get all matching suppliers
    const suppliers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        location: true,
        category: true,
        rating: true,
        verified: true,
        products: true,
        _count: {
          select: {
            rfqs: true,
            leads: true
          }
        }
      }
    });

    // Enhanced matching algorithm
    const matchedSuppliers = suppliers.map(supplier => {
      let matchScore = 0;
      let reasons = [];

      // Category match (40 points)
      if (supplier.category === category) {
        matchScore += 40;
        reasons.push('Perfect category match');
      } else if (supplier.category?.toLowerCase().includes(category?.toLowerCase() || '')) {
        matchScore += 25;
        reasons.push('Related category');
      }

      // Location match (25 points)
      if (supplier.location?.toLowerCase().includes(location?.toLowerCase() || '')) {
        matchScore += 25;
        reasons.push('Location match');
      } else {
        matchScore += 10;
        reasons.push('Different location');
      }

      // Rating match (20 points)
      if (supplier.rating >= 4.5) {
        matchScore += 20;
        reasons.push('Excellent rating');
      } else if (supplier.rating >= 4.0) {
        matchScore += 15;
        reasons.push('Good rating');
      } else if (supplier.rating >= 3.5) {
        matchScore += 10;
        reasons.push('Average rating');
      }

      // Experience match (10 points)
      const totalRfqs = supplier._count.rfqs;
      if (totalRfqs >= 50) {
        matchScore += 10;
        reasons.push('Highly experienced');
      } else if (totalRfqs >= 20) {
        matchScore += 7;
        reasons.push('Experienced');
      } else if (totalRfqs >= 5) {
        matchScore += 5;
        reasons.push('Some experience');
      }

      // Verification bonus (5 points)
      if (supplier.verified) {
        matchScore += 5;
        reasons.push('Verified supplier');
      }

      // Budget compatibility check
      let budgetCompatible = true;
      if (budget && supplier.products) {
        // This would need more sophisticated budget matching logic
        // For now, we'll assume all suppliers can handle the budget
        budgetCompatible = true;
      }

      return {
        ...supplier,
        matchScore,
        reasons,
        budgetCompatible,
        urgencyMatch: urgency === 'high' ? supplier.rating >= 4.0 : true
      };
    })
    .filter(supplier => supplier.budgetCompatible && supplier.urgencyMatch)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10); // Top 10 matches

    // Send notifications to matched suppliers
    await sendSupplierNotifications(matchedSuppliers, rfq);

    return NextResponse.json({
      success: true,
      matches: matchedSuppliers,
      totalMatches: matchedSuppliers.length,
      rfq: {
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        budget: rfq.maxBudget
      }
    });

  } catch (error) {
    console.error('Error matching suppliers:', error);
    return NextResponse.json({ 
      error: 'Failed to match suppliers' 
    }, { status: 500 });
  }
}

async function sendSupplierNotifications(suppliers: any[], rfq: any) {
  try {
    // In a real application, you would send notifications via:
    // - Email notifications
    // - SMS notifications
    // - In-app notifications
    // - Push notifications

    console.log(`Notifying ${suppliers.length} suppliers about RFQ: ${rfq.title}`);
    
    // For now, we'll just log the notifications
    suppliers.forEach(supplier => {
      console.log(`Notification sent to ${supplier.company} (${supplier.email})`);
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
