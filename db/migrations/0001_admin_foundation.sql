CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_user_id" varchar(150) NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(200),
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "admin_users" ADD CONSTRAINT "chk_admin_users_role" CHECK ("role" IN ('admin'));
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_admin_users_auth_user_id" ON "admin_users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_admin_users_email" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_users_active_role" ON "admin_users" USING btree ("active","role");
