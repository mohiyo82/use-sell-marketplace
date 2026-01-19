const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();

  const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

  // hash password
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    await prisma.user.update({ where: { email: EMAIL }, data: { role: 'ADMIN', isActive: true } });
    console.log(`Updated existing user (${EMAIL}) to ADMIN`);
  } else {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: EMAIL,
        password: hashed,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`Created new admin user: ${EMAIL}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
