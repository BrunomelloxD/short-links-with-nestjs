-- CreateTable
CREATE TABLE "log"."portal_access_log" (
    "id" SERIAL NOT NULL,
    "acess_in" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),

    CONSTRAINT "portal_access_log_pkey" PRIMARY KEY ("id")
);
