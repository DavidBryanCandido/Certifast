CREATE TABLE "residents" (
  "resident_id" SERIAL PRIMARY KEY,
  "full_name" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "contact_number" varchar,
  "address_house" varchar,
  "address_street" varchar,
  "date_of_birth" date,
  "civil_status" varchar,
  "status" varchar DEFAULT 'active',
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "admin_accounts" (
  "admin_id" SERIAL PRIMARY KEY,
  "full_name" varchar NOT NULL,
  "username" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "role" varchar NOT NULL,
  "status" varchar DEFAULT 'active',
  "created_at" timestamp DEFAULT (now()),
  "last_login" timestamp
);

CREATE TABLE "certificate_templates" (
  "template_id" SERIAL PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "has_fee" boolean DEFAULT false,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "requests" (
  "request_id" SERIAL PRIMARY KEY,
  "resident_id" int,
  "template_id" int,
  "cert_type" varchar NOT NULL,
  "purpose" varchar,
  "extra_fields" jsonb,
  "notes" text,
  "source" varchar,
  "status" varchar DEFAULT 'pending',
  "rejection_reason" text,
  "requested_at" timestamp DEFAULT (now()),
  "processed_by" int,
  "processed_at" timestamp,
  "released_by" int,
  "released_at" timestamp
);

CREATE TABLE "issued_certificates" (
  "certificate_id" SERIAL PRIMARY KEY,
  "request_id" int,
  "doc_id" varchar UNIQUE NOT NULL,
  "cert_type" varchar NOT NULL,
  "resident_name" varchar NOT NULL,
  "address" text,
  "purpose" varchar,
  "issued_by" int,
  "issued_at" timestamp DEFAULT (now()),
  "source" varchar,
  "qr_code_data" text
);

CREATE TABLE "audit_logs" (
  "log_id" SERIAL PRIMARY KEY,
  "actor_id" int,
  "actor_name" varchar,
  "actor_role" varchar,
  "action_type" varchar NOT NULL,
  "target_table" varchar,
  "target_id" int,
  "description" text,
  "ip_address" varchar,
  "created_at" timestamp DEFAULT (now())
);

COMMENT ON COLUMN "residents"."status" IS 'active | inactive';

COMMENT ON COLUMN "admin_accounts"."role" IS 'superadmin | admin | staff';

COMMENT ON COLUMN "admin_accounts"."status" IS 'active | inactive';

COMMENT ON COLUMN "requests"."source" IS 'resident | walkin';

COMMENT ON COLUMN "requests"."status" IS 'pending | approved | ready | released | rejected';

COMMENT ON COLUMN "issued_certificates"."request_id" IS 'null for walk-ins';

COMMENT ON COLUMN "issued_certificates"."source" IS 'online | walkin';

COMMENT ON COLUMN "audit_logs"."actor_id" IS 'null for system events';

ALTER TABLE "requests" ADD FOREIGN KEY ("resident_id") REFERENCES "residents" ("resident_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "requests" ADD FOREIGN KEY ("template_id") REFERENCES "certificate_templates" ("template_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "requests" ADD FOREIGN KEY ("processed_by") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "requests" ADD FOREIGN KEY ("released_by") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "issued_certificates" ADD FOREIGN KEY ("request_id") REFERENCES "requests" ("request_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "issued_certificates" ADD FOREIGN KEY ("issued_by") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("actor_id") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;
