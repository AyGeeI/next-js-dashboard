-- Add new columns as nullable to avoid issues with existing rows
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerified" TIMESTAMP(3);

-- Fill username column based on the email local part and ensure uniqueness
WITH normalized AS (
  SELECT
    id,
    lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9._-]', '_', 'g')) AS base_username
  FROM "users"
),
numbered AS (
  SELECT
    id,
    base_username,
    ROW_NUMBER() OVER (PARTITION BY base_username ORDER BY id) AS rn
  FROM normalized
)
UPDATE "users" AS u
SET "username" = CASE
    WHEN n.base_username IS NULL OR n.base_username = '' THEN concat('user_', substr(md5(u.id), 1, 8))
    WHEN n.rn = 1 THEN n.base_username
    ELSE concat(n.base_username, '_', n.rn - 1)
  END
FROM numbered AS n
WHERE u.id = n.id;

-- Enforce NOT NULL and new uniqueness requirement
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
