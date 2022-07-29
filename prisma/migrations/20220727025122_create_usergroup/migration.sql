-- CreateEnum
CREATE TYPE "UserGroupRole" AS ENUM ('ADMIN', 'MAINTAINER', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "UserGroupStatus" AS ENUM ('PENDING', 'ACTIVATED', 'DEACTIVATE');

-- CreateTable
CREATE TABLE "user_group" (
    "id" SERIAL NOT NULL,
    "fk_id_user" INTEGER NOT NULL,
    "fk_id_group" INTEGER NOT NULL,
    "role" "UserGroupRole" NOT NULL DEFAULT 'PARTICIPANT',
    "status" "UserGroupStatus" NOT NULL DEFAULT 'ACTIVATED',

    CONSTRAINT "user_group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk_id_user_fkey" FOREIGN KEY ("fk_id_user") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group" ADD CONSTRAINT "user_group_fk_id_group_fkey" FOREIGN KEY ("fk_id_group") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
