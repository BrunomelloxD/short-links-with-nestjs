-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "log";

-- CreateTable
CREATE TABLE "log"."zip_code_logs" (
    "id" SERIAL NOT NULL,
    "zip_code" VARCHAR(8) NOT NULL,
    "consulted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "success" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "zip_code_logs_pkey" PRIMARY KEY ("id")
);
