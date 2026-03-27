import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');

  // Clear existing categories
  console.log('🧹 Clearing existing categories...');
  await prisma.category.deleteMany();

  console.log('🗂️ Creating B2B categories...');

  // Create main categories
  const industrialChemicals = await prisma.category.create({
    data: {
      name: 'Industrial Chemicals',
      description: 'Chemicals used in industrial processes and manufacturing.',
    },
  });

  const constructionMaterials = await prisma.category.create({
    data: {
      name: 'Construction Materials',
      description: 'Materials used for building and construction projects.',
    },
  });

  const agriculture = await prisma.category.create({
    data: {
      name: 'Agriculture & Farming',
      description: 'Products and equipment for agriculture and farming.',
    },
  });

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics & Components',
      description: 'Electronic components and devices for industrial use.',
    },
  });

  const machinery = await prisma.category.create({
    data: {
      name: 'Industrial Machinery',
      description: 'Heavy machinery and industrial equipment.',
    },
  });

  // Create subcategories
  await prisma.category.createMany({
    data: [
      { name: 'Acids', parentId: industrialChemicals.id, description: 'Industrial acids for various applications' },
      { name: 'Solvents', parentId: industrialChemicals.id, description: 'Industrial solvents and cleaning agents' },
      { name: 'Adhesives & Sealants', parentId: industrialChemicals.id, description: 'Industrial adhesives and sealants' },
      { name: 'Cement & Concrete', parentId: constructionMaterials.id, description: 'Cement, concrete and related materials' },
      { name: 'Bricks & Blocks', parentId: constructionMaterials.id, description: 'Building bricks and concrete blocks' },
      { name: 'Steel & Metals', parentId: constructionMaterials.id, description: 'Steel, metals and metal products' },
      { name: 'Fertilizers', parentId: agriculture.id, description: 'Agricultural fertilizers and nutrients' },
      { name: 'Pesticides', parentId: agriculture.id, description: 'Agricultural pesticides and crop protection' },
      { name: 'Seeds & Grains', parentId: agriculture.id, description: 'Agricultural seeds and grain products' },
      { name: 'Semiconductors', parentId: electronics.id, description: 'Semiconductor components and chips' },
      { name: 'Circuit Boards', parentId: electronics.id, description: 'Printed circuit boards and components' },
      { name: 'Sensors', parentId: electronics.id, description: 'Industrial sensors and measurement devices' },
      { name: 'CNC Machines', parentId: machinery.id, description: 'Computer numerical control machines' },
      { name: 'Welding Equipment', parentId: machinery.id, description: 'Industrial welding machines and equipment' },
      { name: 'Pumps & Compressors', parentId: machinery.id, description: 'Industrial pumps and compressors' },
    ],
  });

  console.log('✅ Categories created successfully!');
  console.log('📊 Created 5 main categories with 15 subcategories');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 