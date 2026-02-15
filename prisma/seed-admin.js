// prisma/seed-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@bell24h.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Bell24h Admin';
  const role = process.env.ADMIN_ROLE || 'ADMIN';

  const passwordHash = await bcrypt.hash(password, 10);

  // Using Agent model as per your schema
  await prisma.agent.upsert({
    where: { email },
    update: { passwordHash, role, name },
    create: { email, passwordHash, role, name }
  });

  console.log(`✅ Admin ensured: ${email}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
