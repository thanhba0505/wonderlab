-- CreateEnum
CREATE TYPE "SimulationRequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'PLANNED', 'IN_DEVELOPMENT', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "simulation_requests" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "why_interesting" VARCHAR(2000),
    "proposed_controls" VARCHAR(2000),
    "reference_url" VARCHAR(500),
    "status" "SimulationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT,
    "guest_name" VARCHAR(100),
    "guest_email" VARCHAR(150),
    "admin_notes" VARCHAR(2000),
    "target_slug" VARCHAR(64),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_request_votes" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "user_id" TEXT,
    "client_session" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_request_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulation_requests_status_idx" ON "simulation_requests"("status");

-- CreateIndex
CREATE INDEX "simulation_requests_category_idx" ON "simulation_requests"("category");

-- CreateIndex
CREATE INDEX "simulation_requests_vote_count_idx" ON "simulation_requests"("vote_count" DESC);

-- CreateIndex
CREATE INDEX "simulation_requests_created_at_idx" ON "simulation_requests"("created_at" DESC);

-- CreateIndex
CREATE INDEX "simulation_request_votes_request_id_idx" ON "simulation_request_votes"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_request_votes_request_id_user_id_key" ON "simulation_request_votes"("request_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_request_votes_request_id_client_session_key" ON "simulation_request_votes"("request_id", "client_session");

-- AddForeignKey
ALTER TABLE "simulation_requests" ADD CONSTRAINT "simulation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_request_votes" ADD CONSTRAINT "simulation_request_votes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "simulation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_request_votes" ADD CONSTRAINT "simulation_request_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
