const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Worx2000', 10);

  await prisma.user.create({
    data: {
      email: 'daniel.schwarz@common-semantics.org',
      password: hashedPassword,
      role: 'user',
    },
  });

  console.log("✅ User user created.");
}

main().finally(() => prisma.$disconnect());
