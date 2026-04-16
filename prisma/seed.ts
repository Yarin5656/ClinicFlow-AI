import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Seed admin user (idempotent — only creates if missing).
  const adminEmail = "admin@moveeasy.local"
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        passwordHash: await hash("admin1234", 10),
        isAdmin: true,
      },
    })
    console.log(`✅ Created admin user: ${adminEmail} / admin1234`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // Phase 3 will seed workflows from JSON files here.
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
