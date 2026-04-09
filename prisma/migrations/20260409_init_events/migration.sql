-- CreateTable: EventType enum
CREATE TYPE IF NOT EXISTS "eventtype" AS ENUM ('COSPLAY', 'TOURNAMENT', 'GAME_LAUNCH', 'SPECIAL', 'CINE', 'ANNIVERSARY');

-- CreateTable: events
CREATE TABLE IF NOT EXISTS "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "eventtype" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10),
    "price" INTEGER NOT NULL DEFAULT 0,
    "max_capacity" INTEGER NOT NULL,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: event_bookings
CREATE TABLE IF NOT EXISTS "event_bookings" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "attendee_name" TEXT NOT NULL,
    "attendee_email" TEXT NOT NULL,
    "attendee_phone" TEXT,
    "number_of_tickets" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_active_published_idx" ON "events"("is_active", "is_published");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_bookings_event_id_idx" ON "event_bookings"("event_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_bookings_customer_id_idx" ON "event_bookings"("customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_bookings_status_idx" ON "event_bookings"("status");

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add relation field to customers table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "eventBookings" TEXT[];
