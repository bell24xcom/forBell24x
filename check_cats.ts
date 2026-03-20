import { prisma } from './lib/prisma';
async function main() {
  const cats = await prisma.category.findMany({ select: { name: true, parentId: true }, orderBy: { name: 'asc' } });
  console.log('total:', cats.length);
  const parents = cats.filter(c => c.parentId === null);
  const subs = cats.filter(c => c.parentId !== null);
  console.log('parent count:', parents.length);
  console.log('sub count:', subs.length);
  console.log('PARENTS:');
  parents.forEach(c => console.log(c.name));
  console.log('SUBS sample:');
  subs.slice(0, 30).forEach(c => console.log(c.name));
  await prisma.$disconnect();
}
main().catch(console.error);
