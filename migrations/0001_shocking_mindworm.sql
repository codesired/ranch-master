CREATE TABLE "user_notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"health_alerts" boolean DEFAULT true,
	"low_stock_alerts" boolean DEFAULT true,
	"weather_alerts" boolean DEFAULT true,
	"maintenance_reminders" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "health_records" ALTER COLUMN "cost" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "current_weight" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "birth_weight" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "purchase_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "purchase_date" date;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "sale_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "sale_date" date;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "mother_id" integer;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "father_id" integer;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "genetic_info" text;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "registration_number" varchar;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "microchip_id" varchar;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "expiry_date" date;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "reminder_date" date;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "related_entity_type" varchar;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "related_entity_id" integer;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "uploaded_by" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "performed_by" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "veterinarian_license" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "medication_used" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "dosage" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "batch_number" varchar;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "temperature" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "weight" numeric(8, 2);--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "symptoms" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "diagnosis" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "treatment" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "follow_up_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "attachments" text[];--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_mother_id_animals_id_fk" FOREIGN KEY ("mother_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_father_id_animals_id_fk" FOREIGN KEY ("father_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "related_id";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "related_type";--> statement-breakpoint
ALTER TABLE "health_records" DROP COLUMN "veterinarian";