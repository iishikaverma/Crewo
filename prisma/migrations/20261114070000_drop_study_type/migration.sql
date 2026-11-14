-- Remove 'study' from the PostType enum (Postgres can't drop an enum value in place).
ALTER TYPE "PostType" RENAME TO "PostType_old";
CREATE TYPE "PostType" AS ENUM ('hackathon', 'project');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType" USING ("type"::text::"PostType");
DROP TYPE "PostType_old";
