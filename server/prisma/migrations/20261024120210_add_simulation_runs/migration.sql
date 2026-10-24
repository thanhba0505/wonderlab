-- CreateTable
CREATE TABLE "simulation_runs" (
    "id" TEXT NOT NULL,
    "simulation_slug" VARCHAR(64) NOT NULL,
    "parameters" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "trials_count" INTEGER NOT NULL DEFAULT 1,
    "duration_ms" INTEGER,
    "client_session" VARCHAR(64),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulation_runs_simulation_slug_idx" ON "simulation_runs"("simulation_slug");

-- CreateIndex
CREATE INDEX "simulation_runs_client_session_idx" ON "simulation_runs"("client_session");

-- CreateIndex
CREATE INDEX "simulation_runs_created_at_idx" ON "simulation_runs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "simulation_runs" ADD CONSTRAINT "simulation_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
