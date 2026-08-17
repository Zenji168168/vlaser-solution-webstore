CREATE TABLE IF NOT EXISTS "checkout_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(80) NOT NULL,
	"product_id" integer,
	"product_public_id" varchar(20) NOT NULL,
	"product_sku" varchar(100) NOT NULL,
	"product_name" text NOT NULL,
	"customer_name" varchar(160) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"phone_has_telegram" boolean DEFAULT false NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"payment_method" varchar(40) DEFAULT 'khqr' NOT NULL,
	"payment_provider" varchar(40) DEFAULT 'bakong' NOT NULL,
	"payment_md5" varchar(32) NOT NULL,
	"payment_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"provider_status" integer,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "checkout_orders" ADD CONSTRAINT "checkout_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "checkout_orders" ADD CONSTRAINT "chk_checkout_orders_currency" CHECK ("currency" IN ('USD', 'KHR'));
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "checkout_orders" ADD CONSTRAINT "chk_checkout_orders_payment_status" CHECK ("payment_status" IN ('pending', 'paid', 'expired', 'unavailable'));
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "checkout_orders" ADD CONSTRAINT "chk_checkout_orders_quantity" CHECK ("quantity" > 0);
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_checkout_orders_order_number" ON "checkout_orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_checkout_orders_payment_md5" ON "checkout_orders" USING btree ("payment_md5");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkout_orders_status_created" ON "checkout_orders" USING btree ("payment_status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_checkout_orders_product_public_id" ON "checkout_orders" USING btree ("product_public_id");
