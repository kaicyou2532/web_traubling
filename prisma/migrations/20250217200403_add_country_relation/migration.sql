/*
  Warnings:

  - Added the required column `CountryId` to the `City` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Photourl` to the `City` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "City" ADD COLUMN     "CountryId" INTEGER NOT NULL,
ADD COLUMN     "Photourl" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_CountryId_fkey" FOREIGN KEY ("CountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
