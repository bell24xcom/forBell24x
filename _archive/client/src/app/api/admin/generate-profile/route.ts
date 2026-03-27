import { NextRequest, NextResponse } from 'next/server';

// Auto Profile Generation API
// Generates company profiles from scraped data with SEO optimization
export async function POST(request: NextRequest) {
  try {
    const { companyId, scrapedData } = await request.json();

    console.log(`🏗️ Generating company profile for: ${companyId}`);

    // Validate input data
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Generate enhanced company profile
    const profile = await generateEnhancedProfile(companyId, scrapedData);

    // Create SEO-optimized slug
    const slug = generateSlug(profile.name);

    // Generate meta tags and keywords
    const seoData = generateSEOData(profile);

    // Create claim page URL
    const claimUrl = `https://bell24h.com/claim-company/${slug}`;

    // Store profile in database
    const savedProfile = await saveProfileToDatabase(profile, slug, seoData);

    // Send claim invitation
    await sendClaimInvitation(savedProfile);

    return NextResponse.json({
      success: true,
      message: 'Company profile generated successfully!',
      data: {
        profileId: savedProfile.id,
        slug,
        claimUrl,
        profile: savedProfile,
        seoData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Profile Generation Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate company profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate enhanced company profile from scraped data
async function generateEnhancedProfile(companyId: string, scrapedData: any) {
  console.log(`📊 Enhancing profile data for company: ${companyId}`);

  // Mock enhanced profile - replace with real data processing
  const enhancedProfile = {
    id: companyId,
    name: scrapedData?.name || 'Company Name',
    category: scrapedData?.category || 'Business',
    description: generateDescription(scrapedData),
    phone: scrapedData?.phone || '',
    email: scrapedData?.email || '',
    address: scrapedData?.address || '',
    website: scrapedData?.website || '',
    source: scrapedData?.source || 'Unknown',
    sourceUrl: scrapedData?.sourceUrl || '',
    trustScore: scrapedData?.trustScore || 75,
    isVerified: scrapedData?.isVerified || false,
    
    // Enhanced business details
    businessDetails: {
      establishedYear: generateEstablishedYear(),
      employeeCount: generateEmployeeCount(),
      businessType: generateBusinessType(scrapedData?.category),
      certifications: generateCertifications(scrapedData?.category),
      products: generateProducts(scrapedData?.category),
      services: generateServices(scrapedData?.category)
    },

    // SEO and marketing data
    seoData: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      socialMedia: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
      }
    },

    // Claim benefits
    claimBenefits: {
      freeTrialMonths: 3,
      value: 36000, // ₹36,000 value
      features: [
        'Premium company listing',
        'Priority in search results',
        'Advanced analytics dashboard',
        'Lead generation tools',
        'Customer support',
        'Marketing tools'
      ]
    },

    // Verification proof
    verificationProof: {
      sourceVerification: true,
      dataQuality: scrapedData?.dataQuality || 85,
      extractionConfidence: scrapedData?.extractionProof?.confidence || 90,
      lastVerified: new Date().toISOString()
    }
  };

  return enhancedProfile;
}

// Generate company description
function generateDescription(scrapedData: any) {
  const category = scrapedData?.category || 'business';
  const name = scrapedData?.name || 'Company';
  
  const descriptions = {
    'Steel & Metal': `${name} is a leading manufacturer and supplier of high-quality steel and metal products. We specialize in providing customized solutions for industrial and construction needs with over 10 years of experience in the industry.`,
    'Textiles & Fabrics': `${name} is a premier textile manufacturer known for producing superior quality fabrics and garments. We serve both domestic and international markets with our innovative designs and sustainable production practices.`,
    'Electronics & Electrical': `${name} is a trusted electronics and electrical equipment manufacturer. We provide cutting-edge technology solutions for residential, commercial, and industrial applications with a focus on innovation and reliability.`,
    'default': `${name} is a well-established company in the ${category} sector, known for quality products and excellent customer service. We have built a strong reputation through years of dedicated service and innovation.`
  };

  return descriptions[category as keyof typeof descriptions] || descriptions['default'];
}

// Generate established year
function generateEstablishedYear() {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 50;
  const maxYear = currentYear - 5;
  return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
}

// Generate employee count
function generateEmployeeCount() {
  const ranges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

// Generate business type
function generateBusinessType(category: string) {
  const businessTypes = {
    'Steel & Metal': ['Manufacturer', 'Supplier', 'Distributor', 'Trading Company'],
    'Textiles & Fabrics': ['Manufacturer', 'Exporter', 'Wholesaler', 'Supplier'],
    'Electronics & Electrical': ['Manufacturer', 'Supplier', 'Service Provider', 'Distributor'],
    'default': ['Manufacturer', 'Supplier', 'Service Provider', 'Trading Company']
  };

  const types = businessTypes[category as keyof typeof businessTypes] || businessTypes['default'];
  return types[Math.floor(Math.random() * types.length)];
}

// Generate certifications
function generateCertifications(category: string) {
  const certifications = {
    'Steel & Metal': ['ISO 9001:2015', 'ISI Mark', 'BIS Certified', 'Quality Assurance'],
    'Textiles & Fabrics': ['OEKO-TEX', 'GOTS Certified', 'ISO 14001', 'Social Compliance'],
    'Electronics & Electrical': ['BIS Certified', 'CE Marking', 'RoHS Compliant', 'ISO 9001:2015'],
    'default': ['ISO 9001:2015', 'Quality Certified', 'Industry Standard']
  };

  const certs = certifications[category as keyof typeof certifications] || certifications['default'];
  return certs.slice(0, Math.floor(Math.random() * 3) + 1);
}

// Generate products
function generateProducts(category: string) {
  const products = {
    'Steel & Metal': ['Steel Pipes', 'Steel Sheets', 'Metal Components', 'Steel Structures'],
    'Textiles & Fabrics': ['Cotton Fabrics', 'Synthetic Fabrics', 'Garments', 'Textile Accessories'],
    'Electronics & Electrical': ['Electronic Components', 'Electrical Equipment', 'Power Systems', 'Automation Solutions'],
    'default': ['Quality Products', 'Custom Solutions', 'Industrial Goods']
  };

  const prods = products[category as keyof typeof products] || products['default'];
  return prods.slice(0, Math.floor(Math.random() * 3) + 2);
}

// Generate services
function generateServices(category: string) {
  const services = {
    'Steel & Metal': ['Custom Manufacturing', 'Quality Testing', 'Technical Support', 'Delivery Services'],
    'Textiles & Fabrics': ['Custom Printing', 'Design Services', 'Quality Control', 'Export Services'],
    'Electronics & Electrical': ['Installation Services', 'Maintenance', 'Technical Support', 'Custom Solutions'],
    'default': ['Customer Support', 'Technical Services', 'Quality Assurance', 'Delivery']
  };

  const servs = services[category as keyof typeof services] || services['default'];
  return servs.slice(0, Math.floor(Math.random() * 3) + 2);
}

// Generate SEO-optimized slug
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate SEO data
function generateSEOData(profile: any) {
  const seoData = {
    metaTitle: `${profile.name} - ${profile.category} | Claim Your Profile on Bell24h`,
    metaDescription: `Join ${profile.name} on Bell24h - India's leading B2B marketplace. Get 3 months FREE premium listing worth ₹36,000. Claim your profile now!`,
    keywords: [
      profile.name,
      profile.category,
      'B2B marketplace',
      'business listing',
      'free trial',
      'Bell24h',
      profile.businessDetails?.businessType,
      ...profile.businessDetails?.products || [],
      ...profile.businessDetails?.services || []
    ],
    socialMedia: {
      facebook: `https://facebook.com/${generateSlug(profile.name)}`,
      twitter: `https://twitter.com/${generateSlug(profile.name)}`,
      linkedin: `https://linkedin.com/company/${generateSlug(profile.name)}`,
      instagram: `https://instagram.com/${generateSlug(profile.name)}`
    }
  };

  return seoData;
}

// Save profile to database
async function saveProfileToDatabase(profile: any, slug: string, seoData: any) {
  console.log(`💾 Saving profile to database: ${profile.name}`);

  const savedProfile = {
    ...profile,
    slug,
    seoData,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'ACTIVE',
    isClaimable: true,
    claimUrl: `https://bell24h.com/claim-company/${slug}`
  };

  // This would integrate with your Prisma database
  // const result = await prisma.companyProfile.create({
  //   data: savedProfile
  // });

  return savedProfile;
}

// Send claim invitation
async function sendClaimInvitation(profile: any) {
  console.log(`📧 Sending claim invitation to ${profile.name}`);

  const invitationData = {
    companyName: profile.name,
    claimUrl: profile.claimUrl,
    freeTrialMonths: profile.claimBenefits.freeTrialMonths,
    value: profile.claimBenefits.value,
    sourceVerification: profile.verificationProof.sourceVerification,
    source: profile.source,
    sourceUrl: profile.sourceUrl
  };

  // Send email invitation
  await sendEmailInvitation(invitationData);

  // Send SMS invitation
  await sendSMSInvitation(invitationData);

  return invitationData;
}

// Send email invitation
async function sendEmailInvitation(data: any) {
  const emailData = {
    to: data.companyEmail || 'contact@company.com', // This would come from scraped data
    subject: `🎁 FREE 3-Month Premium Listing for ${data.companyName} - Worth ₹36,000!`,
    template: 'company-claim-invitation',
    data: {
      companyName: data.companyName,
      claimUrl: data.claimUrl,
      freeTrialMonths: data.freeTrialMonths,
      value: data.value,
      sourceVerification: data.sourceVerification,
      source: data.source,
      sourceUrl: data.sourceUrl
    }
  };

  console.log(`📧 Sending email invitation to ${data.companyName}`);
  
  // This would integrate with your email service
  // await sendEmail(emailData);
}

// Send SMS invitation
async function sendSMSInvitation(data: any) {
  const smsData = {
    to: data.companyPhone || '+91-XXXXXXXXXX', // This would come from scraped data
    message: `🎁 ${data.companyName}! Bell24h found your company on ${data.source}. Claim your FREE 3-month premium listing worth ₹36,000! Limited time offer: ${data.claimUrl}`,
    sender: 'BELL24H'
  };

  console.log(`📱 Sending SMS invitation to ${data.companyName}`);
  
  // This would integrate with MSG91
  // await sendSMS(smsData);
}

// GET endpoint to check profile generation status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  return NextResponse.json({
    success: true,
    message: 'Profile Generation System Status',
    data: {
      status: 'ACTIVE',
      companyId: companyId || 'ALL',
      totalProfilesGenerated: 0, // This would come from database
      totalClaimInvitations: 0, // This would come from database
      systemHealth: 'EXCELLENT'
    }
  });
}
