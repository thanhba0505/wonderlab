-- DropForeignKey
ALTER TABLE "otp_tokens" DROP CONSTRAINT "otp_tokens_user_id_fkey";

-- DropIndex
DROP INDEX "users_google_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "google_id",
DROP COLUMN "is_email_verified",
DROP COLUMN "password_hash";

-- DropTable
DROP TABLE "otp_tokens";

-- DropEnum
DROP TYPE "OtpType";
