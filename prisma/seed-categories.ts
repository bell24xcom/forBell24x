/**
 * Bell24h.com — Indian B2B Category Seed
 * Run: npx ts-node prisma/seed-categories.ts
 *      OR: npx prisma db seed (if configured in package.json)
 *
 * Seeds 15 main categories × 6-8 subcategories each = 100+ categories total
 * Safe to re-run — uses upsert (no duplicates).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Metals & Alloys',
    slug: 'metals-alloys',
    icon: '⚙️',
    color: '#6B7280',
    description: 'Steel, iron, aluminium, copper and all metal products',
    subcategories: [
      { name: 'Steel & Iron', slug: 'steel-iron' },
      { name: 'Aluminium & Alloys', slug: 'aluminium-alloys' },
      { name: 'Copper & Brass', slug: 'copper-brass' },
      { name: 'Stainless Steel', slug: 'stainless-steel' },
      { name: 'Pipes & Tubes', slug: 'pipes-tubes' },
      { name: 'Sheets & Coils', slug: 'sheets-coils' },
      { name: 'Wire & Cable', slug: 'wire-cable' },
    ],
  },
  {
    name: 'Chemicals & Petrochemicals',
    slug: 'chemicals-petrochemicals',
    icon: '🧪',
    color: '#EF4444',
    description: 'Industrial chemicals, solvents, acids, and petroleum products',
    subcategories: [
      { name: 'Industrial Chemicals', slug: 'industrial-chemicals' },
      { name: 'Solvents & Acids', slug: 'solvents-acids' },
      { name: 'Dyes & Pigments', slug: 'dyes-pigments' },
      { name: 'Agrochemicals', slug: 'agrochemicals' },
      { name: 'Lubricants & Oils', slug: 'lubricants-oils' },
      { name: 'Resins & Polymers', slug: 'resins-polymers' },
      { name: 'Adhesives & Sealants', slug: 'adhesives-sealants' },
    ],
  },
  {
    name: 'Textiles & Garments',
    slug: 'textiles-garments',
    icon: '🧵',
    color: '#8B5CF6',
    description: 'Fabric, yarn, clothing and textile machinery',
    subcategories: [
      { name: 'Cotton & Yarn', slug: 'cotton-yarn' },
      { name: 'Synthetic Fabric', slug: 'synthetic-fabric' },
      { name: 'Readymade Garments', slug: 'readymade-garments' },
      { name: 'Technical Textiles', slug: 'technical-textiles' },
      { name: 'Knitted Fabrics', slug: 'knitted-fabrics' },
      { name: 'Jute & Natural Fibre', slug: 'jute-natural-fibre' },
    ],
  },
  {
    name: 'Machinery & Equipment',
    slug: 'machinery-equipment',
    icon: '🏭',
    color: '#F59E0B',
    description: 'Industrial machinery, tools, and manufacturing equipment',
    subcategories: [
      { name: 'CNC & Machine Tools', slug: 'cnc-machine-tools' },
      { name: 'Pumps & Compressors', slug: 'pumps-compressors' },
      { name: 'Material Handling', slug: 'material-handling' },
      { name: 'Packaging Machinery', slug: 'packaging-machinery' },
      { name: 'Printing Machinery', slug: 'printing-machinery' },
      { name: 'Welding Equipment', slug: 'welding-equipment' },
      { name: 'Agricultural Machinery', slug: 'agricultural-machinery' },
    ],
  },
  {
    name: 'Electronics & Electricals',
    slug: 'electronics-electricals',
    icon: '⚡',
    color: '#3B82F6',
    description: 'Electronic components, consumer electronics, and electrical goods',
    subcategories: [
      { name: 'Electronic Components', slug: 'electronic-components' },
      { name: 'PCBs & Semiconductors', slug: 'pcbs-semiconductors' },
      { name: 'Switchgear & Controls', slug: 'switchgear-controls' },
      { name: 'Cables & Wires', slug: 'cables-wires' },
      { name: 'LED & Lighting', slug: 'led-lighting' },
      { name: 'Power Equipment', slug: 'power-equipment' },
      { name: 'Sensors & Instruments', slug: 'sensors-instruments' },
    ],
  },
  {
    name: 'Construction & Real Estate',
    slug: 'construction-real-estate',
    icon: '🏗️',
    color: '#92400E',
    description: 'Building materials, hardware, and construction services',
    subcategories: [
      { name: 'Cement & Concrete', slug: 'cement-concrete' },
      { name: 'Bricks & Tiles', slug: 'bricks-tiles' },
      { name: 'Paints & Coatings', slug: 'paints-coatings' },
      { name: 'Plumbing & Sanitary', slug: 'plumbing-sanitary' },
      { name: 'Hardware & Fasteners', slug: 'hardware-fasteners' },
      { name: 'Glass & Glazing', slug: 'glass-glazing' },
      { name: 'Flooring & Roofing', slug: 'flooring-roofing' },
    ],
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    icon: '🌾',
    color: '#10B981',
    description: 'Agricultural produce, processed food, beverages, and FMCG',
    subcategories: [
      { name: 'Grains & Pulses', slug: 'grains-pulses' },
      { name: 'Spices & Herbs', slug: 'spices-herbs' },
      { name: 'Dairy Products', slug: 'dairy-products' },
      { name: 'Processed Food', slug: 'processed-food' },
      { name: 'Beverages & Drinks', slug: 'beverages-drinks' },
      { name: 'Edible Oils', slug: 'edible-oils' },
      { name: 'Seafood & Meat', slug: 'seafood-meat' },
    ],
  },
  {
    name: 'Pharmaceuticals & Healthcare',
    slug: 'pharmaceuticals-healthcare',
    icon: '💊',
    color: '#EC4899',
    description: 'Medicines, medical devices, APIs, and healthcare supplies',
    subcategories: [
      { name: 'API & Bulk Drugs', slug: 'api-bulk-drugs' },
      { name: 'Formulations & Tablets', slug: 'formulations-tablets' },
      { name: 'Medical Devices', slug: 'medical-devices' },
      { name: 'Surgical Instruments', slug: 'surgical-instruments' },
      { name: 'Diagnostic Equipment', slug: 'diagnostic-equipment' },
      { name: 'Herbal & Ayurvedic', slug: 'herbal-ayurvedic' },
    ],
  },
  {
    name: 'Automotive & Transport',
    slug: 'automotive-transport',
    icon: '🚗',
    color: '#1D4ED8',
    description: 'Auto parts, components, tyres, and vehicle accessories',
    subcategories: [
      { name: 'Engine & Transmission', slug: 'engine-transmission' },
      { name: 'Auto Body Parts', slug: 'auto-body-parts' },
      { name: 'Tyres & Wheels', slug: 'tyres-wheels' },
      { name: 'Electrical Auto Parts', slug: 'electrical-auto-parts' },
      { name: 'Filters & Bearings', slug: 'filters-bearings' },
      { name: 'Commercial Vehicles', slug: 'commercial-vehicles' },
    ],
  },
  {
    name: 'Plastics & Rubber',
    slug: 'plastics-rubber',
    icon: '🧴',
    color: '#0891B2',
    description: 'Plastic goods, rubber products, raw granules, and moulding',
    subcategories: [
      { name: 'Plastic Raw Materials', slug: 'plastic-raw-materials' },
      { name: 'Plastic Products', slug: 'plastic-products' },
      { name: 'Rubber & Elastomers', slug: 'rubber-elastomers' },
      { name: 'Packaging Films', slug: 'packaging-films' },
      { name: 'Hoses & Gaskets', slug: 'hoses-gaskets' },
      { name: 'Moulding Services', slug: 'moulding-services' },
    ],
  },
  {
    name: 'Paper & Printing',
    slug: 'paper-printing',
    icon: '📄',
    color: '#78716C',
    description: 'Paper, cardboard, packaging material, and printing services',
    subcategories: [
      { name: 'Writing & Printing Paper', slug: 'writing-printing-paper' },
      { name: 'Kraft & Corrugated', slug: 'kraft-corrugated' },
      { name: 'Specialty Paper', slug: 'specialty-paper' },
      { name: 'Labels & Stickers', slug: 'labels-stickers' },
      { name: 'Printing Services', slug: 'printing-services' },
    ],
  },
  {
    name: 'Agriculture & Farming',
    slug: 'agriculture-farming',
    icon: '🌱',
    color: '#16A34A',
    description: 'Seeds, fertilisers, farm equipment, and crop produce',
    subcategories: [
      { name: 'Seeds & Planting', slug: 'seeds-planting' },
      { name: 'Fertilisers', slug: 'fertilisers' },
      { name: 'Pesticides', slug: 'pesticides' },
      { name: 'Irrigation Equipment', slug: 'irrigation-equipment' },
      { name: 'Organic Produce', slug: 'organic-produce' },
      { name: 'Fresh Fruits & Vegetables', slug: 'fresh-fruits-vegetables' },
    ],
  },
  {
    name: 'IT & Telecom',
    slug: 'it-telecom',
    icon: '💻',
    color: '#7C3AED',
    description: 'Hardware, software, networking, and IT services',
    subcategories: [
      { name: 'Computers & Servers', slug: 'computers-servers' },
      { name: 'Networking Equipment', slug: 'networking-equipment' },
      { name: 'Software & Licenses', slug: 'software-licenses' },
      { name: 'Mobile & Telecom', slug: 'mobile-telecom' },
      { name: 'Security Systems', slug: 'security-systems' },
      { name: 'IT Services & Support', slug: 'it-services-support' },
    ],
  },
  {
    name: 'Furniture & Wood Products',
    slug: 'furniture-wood',
    icon: '🪵',
    color: '#B45309',
    description: 'Furniture, timber, plywood, and wood-based products',
    subcategories: [
      { name: 'Office Furniture', slug: 'office-furniture' },
      { name: 'Home Furniture', slug: 'home-furniture' },
      { name: 'Plywood & Laminates', slug: 'plywood-laminates' },
      { name: 'Timber & Logs', slug: 'timber-logs' },
      { name: 'Wood Panels', slug: 'wood-panels' },
    ],
  },
  {
    name: 'Safety & Security',
    slug: 'safety-security',
    icon: '🛡️',
    color: '#DC2626',
    description: 'Personal protective equipment, fire safety, and security systems',
    subcategories: [
      { name: 'PPE & Safety Gear', slug: 'ppe-safety-gear' },
      { name: 'Fire Safety', slug: 'fire-safety' },
      { name: 'CCTV & Surveillance', slug: 'cctv-surveillance' },
      { name: 'Access Control', slug: 'access-control' },
      { name: 'Industrial Safety', slug: 'industrial-safety' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Bell24h B2B categories...\n');

  let mainCount = 0;
  let subCount = 0;

  for (const [i, cat] of CATEGORIES.entries()) {
    // Upsert main category
    const main = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        level: 1,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        level: 1,
        sortOrder: i + 1,
        isActive: true,
      },
    });

    mainCount++;
    console.log(`✅ ${cat.icon} ${cat.name}`);

    // Upsert subcategories
    for (const [j, sub] of cat.subcategories.entries()) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          parentId: main.id,
          level: 2,
          sortOrder: j + 1,
          isActive: true,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          parentId: main.id,
          level: 2,
          sortOrder: j + 1,
          isActive: true,
        },
      });

      subCount++;
      console.log(`   └─ ${sub.name}`);
    }
  }

  console.log(`\n✅ Done! Created ${mainCount} main categories + ${subCount} subcategories`);
  console.log(`   Total: ${mainCount + subCount} categories in database`);
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
