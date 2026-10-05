ALTER TABLE "Training" ADD COLUMN IF NOT EXISTS "competencyId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Training" ADD CONSTRAINT "Training_competencyId_fkey"
    FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "TrainingEvent" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Werk — Schulungsraum',
    "capacity" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "TrainingEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TrainingEventEnrollment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingEventEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailOutbox" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "TrainingEvent" ADD CONSTRAINT "TrainingEvent_trainingId_fkey"
    FOREIGN KEY ("trainingId") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TrainingEventEnrollment" ADD CONSTRAINT "TrainingEventEnrollment_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "TrainingEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TrainingEventEnrollment" ADD CONSTRAINT "TrainingEventEnrollment_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "TrainingEventEnrollment_eventId_employeeId_key"
  ON "TrainingEventEnrollment"("eventId", "employeeId");
