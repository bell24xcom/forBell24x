const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUsers() {
  try {
    console.log('👥 Creating demo users for Bell24h...');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Demo Buyer
    const buyer = await prisma.user.create({
      data: {
        email: 'demo.buyer@bell24h.com',
        name: 'Demo Buyer',
        companyname: 'TechCorp Industries',
        role: 'BUYER',
        roles: ['buyer'],
        trafficTier: 'GOLD',
        showcaseEnabled: true,
        hashedPassword: hashedPassword,
        brandName: 'TechCorp',
        about: 'Leading technology procurement company',
      },
    });
    console.log(`✅ Demo Buyer created: ${buyer.email}`);

    // Demo Supplier
    const supplier = await prisma.user.create({
      data: {
        email: 'demo.supplier@bell24h.com',
        name: 'Demo Supplier',
        companyname: 'SteelCorp Manufacturing',
        role: 'SUPPLIER',
        roles: ['supplier', 'manufacturer'],
        trafficTier: 'PLATINUM',
        showcaseEnabled: true,
        hashedPassword: hashedPassword,
        brandName: 'SteelCorp',
        about: 'Premium steel and alloy manufacturer',
        msmeCertNumber: 'MSME123456',
      },
    });
    console.log(`✅ Demo Supplier created: ${supplier.email}`);

    // Demo MSME
    const msme = await prisma.user.create({
      data: {
        email: 'demo.msme@bell24h.com',
        name: 'Demo MSME',
        companyname: 'SmallTech Solutions',
        role: 'MSME',
        roles: ['msme', 'supplier'],
        trafficTier: 'SILVER',
        showcaseEnabled: true,
        hashedPassword: hashedPassword,
        brandName: 'SmallTech',
        about: 'Innovative small-scale technology solutions',
        msmeCertNumber: 'MSME789012',
      },
    });
    console.log(`✅ Demo MSME created: ${msme.email}`);

    // Create wallets for all users
    const wallets = await Promise.all([
      prisma.wallet.create({
        data: {
          userId: buyer.id,
          balance: 50000,
          currency: 'INR',
        },
      }),
      prisma.wallet.create({
        data: {
          userId: supplier.id,
          balance: 100000,
          currency: 'INR',
        },
      }),
      prisma.wallet.create({
        data: {
          userId: msme.id,
          balance: 25000,
          currency: 'INR',
        },
      }),
    ]);

    console.log(`✅ Wallets created for all demo users`);

    // Create sample products for supplier
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Premium Steel Alloy',
          description: 'High-grade steel alloy for industrial applications',
          category: 'Metals',
          subcategory: 'Steel',
          basePrice: 45000,
          trafficPrice: 52000,
          msmePrice: 41000,
          supplierId: supplier.id,
          images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
          specifications: 'Grade: AISI 304, Thickness: 2-10mm, Width: 1000-2000mm',
          views: 150,
          impressions: 300,
          rfqCount: 8,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Aluminum Composite Panel',
          description: 'Lightweight aluminum composite for construction',
          category: 'Metals',
          subcategory: 'Aluminum',
          basePrice: 28000,
          trafficPrice: 32000,
          msmePrice: 26000,
          supplierId: supplier.id,
          images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
          specifications: 'Thickness: 3-6mm, Core: PE, Coating: PVDF',
          views: 89,
          impressions: 178,
          rfqCount: 5,
        },
      }),
    ]);

    console.log(`✅ Sample products created for supplier`);

    console.log('\n🎉 Demo users setup complete!');
    console.log('\n📋 Demo Credentials:');
    console.log('Buyer: demo.buyer@bell24h.com / demo123');
    console.log('Supplier: demo.supplier@bell24h.com / demo123');
    console.log('MSME: demo.msme@bell24h.com / demo123');
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUsers();
