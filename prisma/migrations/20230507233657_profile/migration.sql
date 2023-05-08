/*
  Warnings:

  - You are about to drop the column `confirmEmail` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('UNDER_GRADUATE', 'GRADUATE', 'MASTER', 'DOCTOR');

-- CreateEnum
CREATE TYPE "SocialNetworkType" AS ENUM ('FACEBOOK', 'LINKEDIN', 'GITHUB', 'TWITTER');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "confirmEmail",
ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "company_role" TEXT,
ADD COLUMN     "confirm_email" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "degree" "Degree",
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "social_network" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fk_id_user" INTEGER NOT NULL,
    "type" "SocialNetworkType" NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "social_network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fk_id_user" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_network_fk_id_user_type_key" ON "social_network"("fk_id_user", "type");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_fk_id_user_name_key" ON "knowledge"("fk_id_user", "name");

-- AddForeignKey
ALTER TABLE "social_network" ADD CONSTRAINT "social_network_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
