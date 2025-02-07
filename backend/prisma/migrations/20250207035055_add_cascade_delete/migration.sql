-- DropForeignKey
ALTER TABLE "BasicItem" DROP CONSTRAINT "BasicItem_parentItemId_fkey";

-- DropForeignKey
ALTER TABLE "BasicItem" DROP CONSTRAINT "BasicItem_projectId_fkey";

-- AddForeignKey
ALTER TABLE "BasicItem" ADD CONSTRAINT "BasicItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicItem" ADD CONSTRAINT "BasicItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "BasicItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
