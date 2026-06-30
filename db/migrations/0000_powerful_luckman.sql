CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(100),
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(50),
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"logo" text,
	"description" text,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_km" varchar(200),
	"description" text,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"feature_en" text NOT NULL,
	"feature_km" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt_en" varchar(300),
	"alt_km" varchar(300),
	"sort_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"group_en" varchar(100),
	"group_km" varchar(100),
	"key_en" varchar(200) NOT NULL,
	"key_km" varchar(200),
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(20) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"model" varchar(200),
	"name_en" varchar(300) NOT NULL,
	"name_km" varchar(300),
	"brand_id" integer,
	"category_id" integer,
	"short_desc_en" text,
	"short_desc_km" text,
	"desc_en" text,
	"desc_km" text,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"original_price" numeric(10, 2),
	"stock_qty" integer DEFAULT 0,
	"stock_status" varchar(50) DEFAULT 'Price List',
	"published" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"archived" boolean DEFAULT false,
	"warranty_en" text,
	"warranty_km" text,
	"installation_en" text,
	"installation_km" text,
	"package_en" text,
	"package_km" text,
	"seo_title_en" varchar(200),
	"seo_title_km" varchar(200),
	"seo_desc_en" text,
	"seo_desc_km" text,
	"created_by" varchar(100),
	"updated_by" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "products_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_sku" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_products_brand" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_published" ON "products" USING btree ("published");--> statement-breakpoint
CREATE INDEX "idx_products_archived" ON "products" USING btree ("archived");--> statement-breakpoint
CREATE INDEX "idx_products_name" ON "products" USING btree ("name_en");