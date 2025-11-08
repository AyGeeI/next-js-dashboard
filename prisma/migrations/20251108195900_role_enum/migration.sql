-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STANDARD');

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING (
    CASE
      WHEN "role" ILIKE 'admin' THEN 'ADMIN'
      ELSE 'STANDARD'
    END::"Role"
  ),
  ALTER COLUMN "role" SET DEFAULT 'STANDARD';
