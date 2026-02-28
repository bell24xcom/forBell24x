import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Realistic Indian B2B Suppliers
const suppliers = [
  { name: 'Rajesh Kumar', email: 'rajesh@steelindiaworks.com', phone: '+919876543210', company: 'Steel India Works', location: 'Mumbai', category: 'Steel & Metals', gst: '27AABCU9603R1ZM', trustScore: 85 },
  { name: 'Priya Sharma', email: 'priya@textilesdelhi.in', phone: '+919876543211', company: 'Delhi Textiles Co', location: 'Delhi', category: 'Textiles', gst: '07AACCT1234Q1Z5', trustScore: 92 },
  { name: 'Amit Patel', email: 'amit@chemicalsurat.com', phone: '+919876543212', company: 'Surat Chemical Industries', location: 'Surat', category: 'Chemicals', gst: '24AADCP5678M1ZP', trustScore: 78 },
  { name: 'Sneha Reddy', email: 'sneha@electronicsblr.in', phone: '+919876543213', company: 'Bangalore Electronics Hub', location: 'Bangalore', category: 'Electronics', gst: '29AABCR9012N1Z1', trustScore: 88 },
  { name: 'Vikram Singh', email: 'vikram@packagingpune.com', phone: '+919876543214', company: 'Pune Packaging Solutions', location: 'Pune', category: 'Packaging', gst: '27AAICV3456P1ZR', trustScore: 81 },
  { name: 'Anjali Mehta', email: 'anjali@machineryahm.in', phone: '+919876543215', company: 'Ahmedabad Machinery', location: 'Ahmedabad', category: 'Industrial Machinery', gst: '24AAGCM7890Q1Z8', trustScore: 90 },
  { name: 'Karthik Iyer', email: 'karthik@autochennai.com', phone: '+919876543216', company: 'Chennai Auto Components', location: 'Chennai', category: 'Auto Components', gst: '33AABCI2345R1Z6', trustScore: 86 },
  { name: 'Meera Joshi', email: 'meera@pharmahyderabad.in', phone: '+919876543217', company: 'Hyderabad Pharmaceuticals', location: 'Hyderabad', category: 'Pharmaceuticals', gst: '36AAECJ6789S1Z4', trustScore: 94 },
  { name: 'Arjun Rao', email: 'arjun@plasticsbangalore.com', phone: '+919876543218', company: 'Bangalore Plastics Ltd', location: 'Bangalore', category: 'Rubber & Plastics', gst: '29AACCR1234T1Z2', trustScore: 79 },
  { name: 'Divya Nair', email: 'divya@foodcochin.in', phone: '+919876543219', company: 'Cochin Food Products', location: 'Kochi', category: 'Food & Beverages', gst: '32AABCN5678U1Z0', trustScore: 83 },
  { name: 'Rahul Gupta', email: 'rahul@constructiondelhi.com', phone: '+919876543220', company: 'Delhi Construction Materials', location: 'Delhi', category: 'Construction', gst: '07AADCG9012V1Z9', trustScore: 87 },
  { name: 'Pooja Kapoor', email: 'pooja@paperjaipur.in', phone: '+919876543221', company: 'Jaipur Paper Mills', location: 'Jaipur', category: 'Paper Products', gst: '08AAECP3456W1Z7', trustScore: 80 },
  { name: 'Sanjay Yadav', email: 'sanjay@electricalkanpur.com', phone: '+919876543222', company: 'Kanpur Electrical Works', location: 'Kanpur', category: 'Electrical', gst: '09AAFCY7890X1Z5', trustScore: 82 },
  { name: 'Kavita Desai', email: 'kavita@furnituresurat.in', phone: '+919876543223', company: 'Surat Furniture Exports', location: 'Surat', category: 'Furniture', gst: '24AAGCD1234Y1Z3', trustScore: 76 },
  { name: 'Manoj Trivedi', email: 'manoj@rubbermumbai.com', phone: '+919876543224', company: 'Mumbai Rubber Industries', location: 'Mumbai', category: 'Rubber & Plastics', gst: '27AAHCT5678Z1Z1', trustScore: 84 },
  { name: 'Nisha Agarwal', email: 'nisha@leatherkolkata.in', phone: '+919876543225', company: 'Kolkata Leather Goods', location: 'Kolkata', category: 'Leather Goods', gst: '19AABCA9012A1ZY', trustScore: 77 },
  { name: 'Deepak Jain', email: 'deepak@metalsindore.com', phone: '+919876543226', company: 'Indore Metal Works', location: 'Indore', category: 'Steel & Metals', gst: '23AACCJ3456B1ZX', trustScore: 89 },
  { name: 'Rekha Pillai', email: 'rekha@cosmeticsmumbai.in', phone: '+919876543227', company: 'Mumbai Cosmetics Ltd', location: 'Mumbai', category: 'Cosmetics', gst: '27AADCP7890C1ZW', trustScore: 75 },
  { name: 'Suresh Nambiar', email: 'suresh@spiceskerala.com', phone: '+919876543228', company: 'Kerala Spices Export', location: 'Kochi', category: 'Food & Beverages', gst: '32AAECN1234D1ZV', trustScore: 91 },
  { name: 'Geeta Choudhary', email: 'geeta@agriculturepunjab.in', phone: '+919876543229', company: 'Punjab Agriculture Supplies', location: 'Ludhiana', category: 'Agricultural Products', gst: '03AAFCC5678E1ZU', trustScore: 85 },
];

// Realistic Buyers
const buyers = [
  { name: 'Ashok Builders', email: 'ashok@builderspvt.com', phone: '+919998887771', company: 'Ashok Builders Pvt Ltd', location: 'Mumbai' },
  { name: 'Lakshmi Textiles', email: 'lakshmi@textilesltd.in', phone: '+919998887772', company: 'Lakshmi Textiles Ltd', location: 'Coimbatore' },
  { name: 'Tech Solutions India', email: 'tech@solutionsindia.com', phone: '+919998887773', company: 'Tech Solutions India', location: 'Bangalore' },
  { name: 'Sunrise Chemicals', email: 'sunrise@chemicalsco.in', phone: '+919998887774', company: 'Sunrise Chemicals Co', location: 'Pune' },
  { name: 'Golden Packaging', email: 'golden@packagingltd.com', phone: '+919998887775', company: 'Golden Packaging Ltd', location: 'Delhi' },
];

async function main() {
  console.log('🌱 Starting realistic seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing test data...');
  await prisma.quote.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

  console.log('✅ Cleared\n');

  // Create/Update Admin
  console.log('👤 Creating admin...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bell24h.com' },
    update: {},
    create: {
      email: 'admin@bell24h.com',
      phone: '+919876000000',
      name: 'Bell24h Admin',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      company: 'Bell24h',
      trustScore: 100,
    },
  });
  console.log('✅ Admin ready\n');

  // Create Suppliers
  console.log('🏭 Creating 20 suppliers...');
  const createdSuppliers = [];
  for (const sup of suppliers) {
    const supplier = await prisma.user.create({
      data: {
        email: sup.email,
        phone: sup.phone,
        name: sup.name,
        role: 'SUPPLIER',
        isActive: true,
        isVerified: true,
        company: sup.company,
        location: sup.location,
        gstNumber: sup.gst,
        trustScore: sup.trustScore,
      },
    });
    createdSuppliers.push(supplier);
  }
  console.log(`✅ Created ${createdSuppliers.length} suppliers\n`);

  // Create Buyers
  console.log('🛒 Creating 5 buyers...');
  const createdBuyers = [];
  for (const buy of buyers) {
    const buyer = await prisma.user.create({
      data: {
        email: buy.email,
        phone: buy.phone,
        name: buy.name,
        role: 'BUYER',
        isActive: true,
        isVerified: true,
        company: buy.company,
        location: buy.location,
        trustScore: 70,
      },
    });
    createdBuyers.push(buyer);
  }
  console.log(`✅ Created ${createdBuyers.length} buyers\n`);

  // Create Sample RFQs
  console.log('📋 Creating 10 sample RFQs...');
  const sampleRFQs = [
    {
      title: '500 kg MS Steel Rods Required',
      description: 'Need 500 kg of mild steel rods, Fe500 grade, 12mm diameter',
      category: 'Steel & Metals',
      quantity: '500',
      unit: 'kg',
      minBudget: 25000,
      maxBudget: 30000,
      timeline: '2 weeks',
      location: 'Mumbai',
      urgency: 'HIGH',
      buyer: createdBuyers[0],
    },
    {
      title: '1000 meters Cotton Fabric',
      description: 'Premium cotton fabric, white color, 60-inch width',
      category: 'Textiles',
      quantity: '1000',
      unit: 'meters',
      minBudget: 50000,
      maxBudget: 60000,
      timeline: '1 month',
      location: 'Delhi',
      urgency: 'NORMAL',
      buyer: createdBuyers[1],
    },
    {
      title: 'Industrial Chemical Solvents - Bulk Order',
      description: 'Need acetone and methanol, industrial grade, 500 liters each',
      category: 'Chemicals',
      quantity: '1000',
      unit: 'liters',
      minBudget: 80000,
      maxBudget: 100000,
      timeline: '3 weeks',
      location: 'Pune',
      urgency: 'URGENT',
      buyer: createdBuyers[3],
    },
    {
      title: 'LED Bulbs Wholesale - 5000 units',
      description: '9W LED bulbs, warm white, B22 base, branded',
      category: 'Electronics',
      quantity: '5000',
      unit: 'pieces',
      minBudget: 150000,
      maxBudget: 200000,
      timeline: '1 month',
      location: 'Bangalore',
      urgency: 'NORMAL',
      buyer: createdBuyers[2],
    },
    {
      title: 'Corrugated Boxes for Export',
      description: '3-ply corrugated boxes, 12x10x8 inches, brown kraft',
      category: 'Packaging',
      quantity: '10000',
      unit: 'boxes',
      minBudget: 120000,
      maxBudget: 150000,
      timeline: '2 weeks',
      location: 'Delhi',
      urgency: 'HIGH',
      buyer: createdBuyers[4],
    },
    {
      title: 'CNC Machine Parts - Custom Manufacturing',
      description: 'Need custom CNC machined parts as per drawings, aluminum',
      category: 'Industrial Machinery',
      quantity: '200',
      unit: 'pieces',
      minBudget: 300000,
      maxBudget: 400000,
      timeline: '1 month',
      location: 'Ahmedabad',
      urgency: 'NORMAL',
      buyer: createdBuyers[0],
    },
    {
      title: 'Auto Brake Pads - Urgent Requirement',
      description: 'Brake pads for commercial vehicles, ceramic type',
      category: 'Auto Components',
      quantity: '500',
      unit: 'sets',
      minBudget: 200000,
      maxBudget: 250000,
      timeline: '1 week',
      location: 'Chennai',
      urgency: 'URGENT',
      buyer: createdBuyers[1],
    },
    {
      title: 'Pharmaceutical API - Paracetamol',
      description: 'Paracetamol API, USP grade, with COA',
      category: 'Pharmaceuticals',
      quantity: '100',
      unit: 'kg',
      minBudget: 150000,
      maxBudget: 180000,
      timeline: '3 weeks',
      location: 'Hyderabad',
      urgency: 'NORMAL',
      buyer: createdBuyers[2],
    },
    {
      title: 'PVC Pipes for Construction',
      description: '4-inch PVC pipes, ISI marked, 6-meter length',
      category: 'Construction',
      quantity: '1000',
      unit: 'pieces',
      minBudget: 180000,
      maxBudget: 220000,
      timeline: '2 weeks',
      location: 'Mumbai',
      urgency: 'HIGH',
      buyer: createdBuyers[3],
    },
    {
      title: 'Office Furniture - Bulk Order',
      description: 'Office desks and chairs, modular type, 50 sets',
      category: 'Furniture',
      quantity: '50',
      unit: 'sets',
      minBudget: 250000,
      maxBudget: 300000,
      timeline: '1 month',
      location: 'Bangalore',
      urgency: 'NORMAL',
      buyer: createdBuyers[4],
    },
  ];

  for (const rfq of sampleRFQs) {
    await prisma.rFQ.create({
      data: {
        title: rfq.title,
        description: rfq.description,
        category: rfq.category,
        quantity: rfq.quantity,
        unit: rfq.unit,
        minBudget: rfq.minBudget,
        maxBudget: rfq.maxBudget,
        timeline: rfq.timeline,
        location: rfq.location,
        urgency: rfq.urgency as any,
        status: 'ACTIVE',
        isPublic: true,
        tags: [],
        priority: rfq.urgency === 'URGENT' ? 5 : rfq.urgency === 'HIGH' ? 4 : 3,
        createdBy: rfq.buyer.id,
      },
    });
  }
  console.log('✅ Created 10 RFQs\n');

  // Summary
  console.log('📊 SEED COMPLETE!\n');
  console.log('Summary:');
  console.log(`  👤 Admin: 1`);
  console.log(`  🏭 Suppliers: ${createdSuppliers.length}`);
  console.log(`  🛒 Buyers: ${createdBuyers.length}`);
  console.log(`  📋 Active RFQs: ${sampleRFQs.length}`);
  console.log('\n');
  console.log('Test Accounts:');
  console.log(`  Buyer: ${createdBuyers[0].email} (${createdBuyers[0].phone})`);
  console.log(`  Supplier: ${createdSuppliers[0].email} (${createdSuppliers[0].phone})`);
  console.log('\n✅ Ready for testing!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
