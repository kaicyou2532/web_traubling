/*
  Warnings:

  - Changed the type of `travelMonth` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `travelYear` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "travelMonth",
ADD COLUMN     "travelMonth" INTEGER NOT NULL,
DROP COLUMN "travelYear",
ADD COLUMN     "travelYear" INTEGER NOT NULL;
