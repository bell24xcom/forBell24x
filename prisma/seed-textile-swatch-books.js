const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const textileChildren = [
  {
    name: 'Upholstery Fabric Swatch Books',
    slug: 'upholstery-fabric-swatch-books',
    description: 'Sample books for upholstery fabrics, export collections, and interior buyers.',
    priority: 8,
  },
  {
    name: 'Curtain Fabric Swatch Books',
    slug: 'curtain-fabric-swatch-books',
    description: 'Curtain and drapery swatch books for domestic and export buyers.',
    priority: 9,
  },
  {
    name: 'Fabric Sample Cards',
    slug: 'fabric-sample-cards',
    description: 'Compact fabric sample cards for retailers, designers, and specifiers.',
    priority: 10,
  },
  {
    name: 'Sample Book Fasteners & Binding Hardware',
    slug: 'sample-book-fasteners-binding-hardware',
    description: 'Binding, corner, ring, and fastener hardware for sample books and swatch sets.',
    priority: 11,
  },
];

const seedRfqSpecs = [
  {
    title: 'Upholstery Fabric Swatch Books for Worldwide Buyers',
    slug: 'upholstery-fabric-swatch-books-worldwide-buyers',
    categorySlug: 'upholstery-fabric-swatch-books',
    location: 'Worldwide',
    quantity: '500 sample books',
    budget: 750000,
    minBudget: 500000,
    maxBudget: 1000000,
    urgency: 'HIGH',
    timeline: '2 weeks',
    description:
      'Need export-grade upholstery fabric swatch books with branded binding, labeled fabric cuts, and premium presentation for global buyers.',
    requirements:
      '50 to 100 fabric options per book, export finishing, consistent color matching, and durable binding hardware.',
    tags: ['textiles', 'swatch-books', 'upholstery', 'worldwide', 'export'],
  },
  {
    title: 'Curtain Fabric Swatch Books for Pan India Rollout',
    slug: 'curtain-fabric-swatch-books-pan-india-rollout',
    categorySlug: 'curtain-fabric-swatch-books',
    location: 'Pan India',
    quantity: '1,000 sample books',
    budget: 1200000,
    minBudget: 800000,
    maxBudget: 1600000,
    urgency: 'HIGH',
    timeline: '3 weeks',
    description:
      'Looking for curtain fabric swatch books for dealer showrooms, architects, and interior design buyers across India.',
    requirements:
      'Swatches for blackout, sheer, printed, and premium drapery fabrics with neat presentation and fast turnaround.',
    tags: ['textiles', 'curtain', 'swatch-books', 'pan-india', 'interiors'],
  },
  {
    title: 'Fabric Sample Cards for Worldwide Interior Buyers',
    slug: 'fabric-sample-cards-worldwide-interior-buyers',
    categorySlug: 'fabric-sample-cards',
    location: 'Worldwide',
    quantity: '2,000 sample cards',
    budget: 450000,
    minBudget: 300000,
    maxBudget: 600000,
    urgency: 'NORMAL',
    timeline: '2 weeks',
    description:
      'Need compact fabric sample cards for export buyers, showrooms, and specifier presentations.',
    requirements:
      'Accurate color reproduction, stitched or clipped presentation, and export-ready labeling.',
    tags: ['textiles', 'sample-cards', 'worldwide', 'export'],
  },
  {
    title: 'Sample Book Fasteners & Binding Hardware for Pan India Supply',
    slug: 'sample-book-fasteners-binding-hardware-pan-india-supply',
    categorySlug: 'sample-book-fasteners-binding-hardware',
    location: 'Pan India',
    quantity: '25,000 sets',
    budget: 300000,
    minBudget: 200000,
    maxBudget: 450000,
    urgency: 'NORMAL',
    timeline: '2 weeks',
    description:
      'Bulk requirement for sample book fasteners, binding strips, corners, rings, and hardware for textile sample book makers.',
    requirements:
      'Consistent hardware sizing, rust-resistant finish, and fast dispatch across India.',
    tags: ['textiles', 'binding-hardware', 'sample-books', 'pan-india'],
  },
  {
    title: 'Upholstery Fabric Swatch Books for Pan India Dealers',
    slug: 'upholstery-fabric-swatch-books-pan-india-dealers',
    categorySlug: 'upholstery-fabric-swatch-books',
    location: 'Pan India',
    quantity: '750 sample books',
    budget: 900000,
    minBudget: 600000,
    maxBudget: 1200000,
    urgency: 'HIGH',
    timeline: '3 weeks',
    description:
      'Need upholstery fabric swatch books for dealer network rollout, with uniform branding and presentation.',
    requirements:
      'Multi-city distribution support, premium finishing, and repeat order capacity.',
    tags: ['textiles', 'upholstery', 'swatch-books', 'pan-india'],
  },
  {
    title: 'Curtain Fabric Swatch Books for Worldwide Hospitality Buyers',
    slug: 'curtain-fabric-swatch-books-worldwide-hospitality-buyers',
    categorySlug: 'curtain-fabric-swatch-books',
    location: 'Worldwide',
    quantity: '400 sample books',
    budget: 680000,
    minBudget: 450000,
    maxBudget: 900000,
    urgency: 'NORMAL',
    timeline: '3 weeks',
    description:
      'Swatch books for hotels, interior firms, and hospitality procurement teams outside India.',
    requirements:
      'Fire-retardant fabric labeling support, export packaging, and clean binding hardware.',
    tags: ['textiles', 'curtain', 'hospitality', 'worldwide', 'export'],
  },
  {
    title: 'Fabric Sample Cards for Pan India Showrooms',
    slug: 'fabric-sample-cards-pan-india-showrooms',
    categorySlug: 'fabric-sample-cards',
    location: 'Pan India',
    quantity: '1,500 sample cards',
    budget: 250000,
    minBudget: 150000,
    maxBudget: 350000,
    urgency: 'LOW',
    timeline: '1 week',
    description:
      'Compact sample cards for textile showrooms, retail counters, and interior consultants across India.',
    requirements:
      'Quick dispatch, neat stitching or clamping, and consistent sample cutting.',
    tags: ['textiles', 'sample-cards', 'showrooms', 'pan-india'],
  },
  {
    title: 'Sample Book Fasteners & Binding Hardware for Worldwide Export',
    slug: 'sample-book-fasteners-binding-hardware-worldwide-export',
    categorySlug: 'sample-book-fasteners-binding-hardware',
    location: 'Worldwide',
    quantity: '40,000 sets',
    budget: 520000,
    minBudget: 350000,
    maxBudget: 700000,
    urgency: 'NORMAL',
    timeline: '3 weeks',
    description:
      'Need export-ready fasteners and binding hardware for textile sample book manufacturers serving international buyers.',
    requirements:
      'Reliable quality, corrosion resistance, and bulk packaging for export shipments.',
    tags: ['textiles', 'binding-hardware', 'worldwide', 'export'],
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function upsertChildCategory(parentId, child) {
  return prisma.category.upsert({
    where: { slug: child.slug },
    update: {
      name: child.name,
      description: child.description,
      parentId,
      isActive: true,
      priority: child.priority,
      icon: '🧵',
    },
    create: {
      name: child.name,
      slug: child.slug,
      description: child.description,
      parentId,
      isActive: true,
      priority: child.priority,
      icon: '🧵',
    },
  });
}

async function upsertRfq(rfq, category) {
  const slug = rfq.slug || slugify(rfq.title);
  return prisma.rFQ.upsert({
    where: { slug },
    update: {
      title: rfq.title,
      description: rfq.description,
      category: category.name,
      categoryId: category.id,
      quantity: rfq.quantity,
      unit: 'units',
      status: 'ACTIVE',
      location: rfq.location,
      maxBudget: rfq.maxBudget,
      minBudget: rfq.minBudget,
      priority: rfq.urgency === 'HIGH' ? 4 : 3,
      requirements: rfq.requirements,
      tags: rfq.tags,
      timeline: rfq.timeline,
      urgency: rfq.urgency,
      isPublic: true,
      isSeeded: true,
      type: 'requirement',
    },
    create: {
      slug,
      title: rfq.title,
      description: rfq.description,
      category: category.name,
      categoryId: category.id,
      quantity: rfq.quantity,
      unit: 'units',
      status: 'ACTIVE',
      location: rfq.location,
      maxBudget: rfq.maxBudget,
      minBudget: rfq.minBudget,
      priority: rfq.urgency === 'HIGH' ? 4 : 3,
      requirements: rfq.requirements,
      tags: rfq.tags,
      timeline: rfq.timeline,
      urgency: rfq.urgency,
      isPublic: true,
      isSeeded: true,
      type: 'requirement',
    },
  });
}

async function main() {
  console.log('Seeding textile swatch-book categories and RFQs...');

  const parent = await prisma.category.findUnique({
    where: { slug: 'textiles-yarn-fabrics' },
  });

  if (!parent) {
    throw new Error('Parent category "Textiles, Yarn & Fabrics" was not found.');
  }

  const childBySlug = new Map();

  for (const child of textileChildren) {
    const row = await upsertChildCategory(parent.id, child);
    childBySlug.set(child.slug, row);
    console.log(`  category: ${row.name}`);
  }

  for (const rfq of seedRfqSpecs) {
    const category = childBySlug.get(rfq.categorySlug);

    if (!category) {
      throw new Error(`Missing seeded category for slug "${rfq.categorySlug}"`);
    }

    await upsertRfq(rfq, category);
    console.log(`  rfq: ${rfq.title} (${rfq.location})`);
  }

  console.log('Textile seeding complete.');
}

main()
  .catch((error) => {
    console.error('Textile seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
