import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');

    const email = process.env.ADMIN_EMAIL || 'admin@bell24h.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const name = process.env.ADMIN_NAME || 'Bell24h Admin';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // First create a company for the admin
    const adminCompany = await prisma.company.upsert({
      where: { name: 'Bell24h Admin' },
      update: {},
      create: {
        name: 'Bell24h Admin',
        industry: 'Technology',
        address: 'Bell24h Headquarters',
      }
    });

    // Create the admin user
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
        password: hashedPassword,
        name
      },
      create: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        name,
        companyId: adminCompany.id
      }
    });

    console.log(`✅ Admin user created successfully: ${admin.email}`);
    console.log(`🔑 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`🌐 Admin Panel: https://bell24h-app-production.up.railway.app/admin`);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
