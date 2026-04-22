-- AlterTable
ALTER TABLE "User" ADD COLUMN "leadFormConfig" JSONB,
ADD COLUMN "leadFormSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_leadFormSlug_key" ON "User"("leadFormSlug");
