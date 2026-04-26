import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const userEmail = process.env.SEED_USER_EMAIL
  if (!userEmail) throw new Error("Set SEED_USER_EMAIL env var to your clinic user email")

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) throw new Error(`User ${userEmail} not found`)

  // Clean existing demo data
  await prisma.formField.deleteMany({ where: { template: { userId: user.id } } })
  await prisma.formTemplate.deleteMany({ where: { userId: user.id } })
  await prisma.service.deleteMany({ where: { userId: user.id } })
  await prisma.serviceCategory.deleteMany({ where: { userId: user.id } })

  // ── Aesthetic Clinic ──────────────────────────────────────────

  const botoxCategory = await prisma.serviceCategory.create({
    data: { userId: user.id, name: "הזרקות", displayOrder: 0 },
  })
  const laserCategory = await prisma.serviceCategory.create({
    data: { userId: user.id, name: "לייזר", displayOrder: 1 },
  })

  const botox = await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "בוטוקס פנים", description: "הזרקת בוטוקס לאזורי הפנים", priceType: "exact", priceValue: 80000, durationMin: 30, displayOrder: 0 },
  })
  await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "פילר שפתיים", description: "הגדלה ועיצוב שפתיים", priceType: "from", priceValue: 60000, durationMin: 45, displayOrder: 1 },
  })
  await prisma.service.create({
    data: { userId: user.id, categoryId: botoxCategory.id, name: "ייעוץ אסתטי", description: "פגישת ייעוץ חינמית", priceType: "exact", priceValue: 0, durationMin: 20, displayOrder: 2 },
  })
  const laser = await prisma.service.create({
    data: { userId: user.id, categoryId: laserCategory.id, name: "הסרת שיער לייזר", priceType: "from", priceValue: 20000, durationMin: 30, displayOrder: 3 },
  })

  // Form template
  const template = await prisma.formTemplate.create({
    data: {
      userId: user.id,
      title: "קבעי תור לייעוץ",
      subtitle: "השאירי פרטים ונחזור אלייך בהקדם",
      isActive: true,
    },
  })

  // Fields
  await prisma.formField.createMany({
    data: [
      {
        templateId: template.id, type: "radio", key: "first_visit",
        label: "האם זה הטיפול הראשון שלך?", isRequired: false, displayOrder: 0,
        options: [{ label: "כן", value: "yes" }, { label: "לא", value: "no" }],
        conditions: [{ fieldKey: "service_id", operator: "eq", value: botox.id }],
      },
      {
        templateId: template.id, type: "select", key: "laser_area",
        label: "איזור להסרת שיער", isRequired: false, displayOrder: 1,
        options: [
          { label: "רגליים", value: "legs" }, { label: "בית השחי", value: "underarm" },
          { label: "פנים", value: "face" }, { label: "ביקיני", value: "bikini" },
        ],
        conditions: [{ fieldKey: "service_id", operator: "eq", value: laser.id }],
      },
      {
        templateId: template.id, type: "textarea", key: "notes",
        label: "הערות נוספות", placeholder: "כל פרט שחשוב לנו לדעת...", isRequired: false, displayOrder: 2,
      },
    ],
  })

  console.log(`✓ Seeded aesthetic clinic for ${userEmail}`)
  console.log(`  Services: בוטוקס, פילר, ייעוץ, לייזר`)
  console.log(`  FormTemplate active: true`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
