-- =============================================================
-- CertiFast — Full Schema  (v3)
-- Barangay East Tapinac, Olongapo City
--
-- New in this version:
--   • puroks  — lookup table for Purok 1–12  (admin-manageable)
--   • streets — lookup table for all streets  (admin-manageable)
--   • residents now stores purok_id / street_id as FKs instead of
--     raw varchar strings, with house_number as a plain text field
--   • Split name: first_name, middle_name, last_name
--   • Pending verification + ID upload fields
--   • Legacy address_house / address_street kept as composed strings
--     for certificate printing (populated by backend on every save)
-- =============================================================


-- ─── 0. DROP ORDER (fresh DB only — uncomment if needed) ─────
-- DROP TABLE IF EXISTS
--   audit_logs, issued_certificates, requests,
--   certificate_templates, admin_accounts, residents,
--   streets, puroks CASCADE;


-- ─── 1. PUROKS ───────────────────────────────────────────────
CREATE TABLE "puroks" (
  "purok_id"   SERIAL PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "is_active"  boolean NOT NULL DEFAULT true,
  "sort_order" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

COMMENT ON TABLE  "puroks"             IS 'Puroks within Barangay East Tapinac. Admin can add, rename, or deactivate.';
COMMENT ON COLUMN "puroks"."is_active" IS 'false = hidden from resident dropdown without deleting data.';

INSERT INTO "puroks" (name, sort_order) VALUES
  ('Purok 1',  1), ('Purok 2',  2), ('Purok 3',  3),
  ('Purok 4',  4), ('Purok 5',  5), ('Purok 6',  6),
  ('Purok 7',  7), ('Purok 8',  8), ('Purok 9',  9),
  ('Purok 10',10), ('Purok 11',11), ('Purok 12',12);


-- ─── 2. STREETS ──────────────────────────────────────────────
CREATE TABLE "streets" (
  "street_id"  SERIAL PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "is_active"  boolean NOT NULL DEFAULT true,
  "sort_order" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

COMMENT ON TABLE  "streets"             IS 'Streets within Barangay East Tapinac. Admin can add, rename, or deactivate.';
COMMENT ON COLUMN "streets"."is_active" IS 'false = hidden from resident dropdown without deleting data.';

INSERT INTO "streets" (name, sort_order) VALUES
  ('1st Street',               1),
  ('2nd Street',               2),
  ('3rd Street',               3),
  ('4th Street',               4),
  ('5th Street',               5),
  ('6th Street',               6),
  ('7th Street',               7),
  ('8th Street',               8),
  ('9th Street',               9),
  ('10th Street',             10),
  ('11th Street',             11),
  ('12th Street',             12),
  ('13th Street',             13),
  ('14th Street',             14),
  ('15th Street',             15),
  ('Aguinaldo Street',        16),
  ('Ambrosio Padilla Street', 17),
  ('Burgos Street',           18),
  ('Del Pilar Street',        19),
  ('Gallagher Street',        20),
  ('Luna Street',             21),
  ('Mabini Street',           22),
  ('Rizal Street',            23);


-- ─── 3. RESIDENTS ────────────────────────────────────────────
CREATE TABLE "residents" (
  "resident_id"    SERIAL PRIMARY KEY,

  -- Name (split fields — full_name is composed by backend)
  "first_name"     varchar NOT NULL,
  "middle_name"    varchar,
  "last_name"      varchar NOT NULL,
  "full_name"      varchar NOT NULL,

  "email"          varchar UNIQUE NOT NULL,
  "password_hash"  varchar NOT NULL,
  "contact_number" varchar,

  -- Structured address
  "house_number"   varchar,        -- e.g. "12-B", "Lot 7", "Unit 3"
  "purok_id"       int,            -- FK → puroks
  "street_id"      int,            -- FK → streets  (null when street_other is used)
  "street_other"   varchar,        -- free-text, filled only when street not in streets table

  -- Composed strings kept for certificate printing & backward compat
  -- Backend must populate these from the structured fields on every save:
  --   address_house  = house_number + ", " + purok.name
  --   address_street = street.name (or street_other) + ", Brgy. East Tapinac, Olongapo City"
  "address_house"  varchar,
  "address_street" varchar,

  -- Profile
  "date_of_birth"  date,
  "civil_status"   varchar,

  -- Residency verification
  "id_type"        varchar,        -- e.g. "Barangay ID", "Voter's ID"
  "id_image_url"   varchar,        -- Supabase Storage URL of uploaded ID photo
  "verified_by"    int,            -- FK → admin_accounts (who approved)
  "verified_at"    timestamp,

  -- Account
  "status"         varchar NOT NULL DEFAULT 'pending_verification',
  "created_at"     timestamp NOT NULL DEFAULT (now())
);

COMMENT ON COLUMN "residents"."house_number"  IS 'House / unit / lot number entered by resident during registration.';
COMMENT ON COLUMN "residents"."purok_id"      IS 'FK to puroks table.';
COMMENT ON COLUMN "residents"."street_id"     IS 'FK to streets table. NULL when resident used street_other.';
COMMENT ON COLUMN "residents"."street_other"  IS 'Free-text street name when not found in streets lookup table.';
COMMENT ON COLUMN "residents"."address_house" IS 'Composed: house_number + purok name. Set by backend on save.';
COMMENT ON COLUMN "residents"."address_street"IS 'Composed: street name + Brgy. East Tapinac + Olongapo City. Set by backend.';
COMMENT ON COLUMN "residents"."id_image_url"  IS 'Supabase Storage URL of the uploaded valid ID photo.';
COMMENT ON COLUMN "residents"."verified_by"   IS 'admin_id of the staff member who approved residency verification.';
COMMENT ON COLUMN "residents"."status"        IS 'pending_verification | active | inactive';


-- ─── 4. ADMIN ACCOUNTS ───────────────────────────────────────
CREATE TABLE "admin_accounts" (
  "admin_id"      SERIAL PRIMARY KEY,
  "full_name"     varchar NOT NULL,
  "username"      varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "role"          varchar NOT NULL,
  "status"        varchar NOT NULL DEFAULT 'active',
  "created_at"    timestamp NOT NULL DEFAULT (now()),
  "last_login"    timestamp
);

COMMENT ON COLUMN "admin_accounts"."role"   IS 'superadmin | admin | staff';
COMMENT ON COLUMN "admin_accounts"."status" IS 'active | inactive';


-- ─── 5. CERTIFICATE TEMPLATES ────────────────────────────────
CREATE TABLE "certificate_templates" (
  "template_id" SERIAL PRIMARY KEY,
  "name"        varchar UNIQUE NOT NULL,
  "has_fee"     boolean NOT NULL DEFAULT false,
  "description" text,
  "is_active"   boolean NOT NULL DEFAULT true,
  "created_at"  timestamp NOT NULL DEFAULT (now())
);


-- ─── 6. REQUESTS ─────────────────────────────────────────────
CREATE TABLE "requests" (
  "request_id"       SERIAL PRIMARY KEY,
  "resident_id"      int,
  "template_id"      int,
  "cert_type"        varchar NOT NULL,
  "purpose"          varchar,
  "extra_fields"     jsonb,
  "notes"            text,
  "source"           varchar,
  "status"           varchar NOT NULL DEFAULT 'pending',
  "rejection_reason" text,
  "requested_at"     timestamp NOT NULL DEFAULT (now()),
  "processed_by"     int,
  "processed_at"     timestamp,
  "released_by"      int,
  "released_at"      timestamp
);

COMMENT ON COLUMN "requests"."source" IS 'resident | walkin';
COMMENT ON COLUMN "requests"."status" IS 'pending | approved | ready | released | rejected';


-- ─── 7. ISSUED CERTIFICATES ──────────────────────────────────
CREATE TABLE "issued_certificates" (
  "certificate_id" SERIAL PRIMARY KEY,
  "request_id"     int,
  "doc_id"         varchar UNIQUE NOT NULL,
  "cert_type"      varchar NOT NULL,
  "resident_name"  varchar NOT NULL,
  "address"        text,
  "purpose"        varchar,
  "issued_by"      int,
  "issued_at"      timestamp NOT NULL DEFAULT (now()),
  "source"         varchar,
  "qr_code_data"   text
);

COMMENT ON COLUMN "issued_certificates"."request_id" IS 'NULL for walk-ins.';
COMMENT ON COLUMN "issued_certificates"."source"     IS 'online | walkin';


-- ─── 8. AUDIT LOGS ───────────────────────────────────────────
CREATE TABLE "audit_logs" (
  "log_id"       SERIAL PRIMARY KEY,
  "actor_id"     int,
  "actor_name"   varchar,
  "actor_role"   varchar,
  "action_type"  varchar NOT NULL,
  "target_table" varchar,
  "target_id"    int,
  "description"  text,
  "ip_address"   varchar,
  "created_at"   timestamp NOT NULL DEFAULT (now())
);

COMMENT ON COLUMN "audit_logs"."actor_id" IS 'NULL for system-generated events.';


-- ─── 9. FOREIGN KEYS ─────────────────────────────────────────
-- residents address FKs
ALTER TABLE "residents"
  ADD FOREIGN KEY ("purok_id")   REFERENCES "puroks"  ("purok_id")  DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "residents"
  ADD FOREIGN KEY ("street_id")  REFERENCES "streets" ("street_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "residents"
  ADD FOREIGN KEY ("verified_by") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;

-- requests
ALTER TABLE "requests"
  ADD FOREIGN KEY ("resident_id")  REFERENCES "residents"            ("resident_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "requests"
  ADD FOREIGN KEY ("template_id")  REFERENCES "certificate_templates" ("template_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "requests"
  ADD FOREIGN KEY ("processed_by") REFERENCES "admin_accounts"       ("admin_id")    DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "requests"
  ADD FOREIGN KEY ("released_by")  REFERENCES "admin_accounts"       ("admin_id")    DEFERRABLE INITIALLY IMMEDIATE;

-- issued_certificates
ALTER TABLE "issued_certificates"
  ADD FOREIGN KEY ("request_id") REFERENCES "requests"       ("request_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "issued_certificates"
  ADD FOREIGN KEY ("issued_by")  REFERENCES "admin_accounts" ("admin_id")   DEFERRABLE INITIALLY IMMEDIATE;

-- audit_logs
ALTER TABLE "audit_logs"
  ADD FOREIGN KEY ("actor_id") REFERENCES "admin_accounts" ("admin_id") DEFERRABLE INITIALLY IMMEDIATE;


-- =============================================================
-- MIGRATION SCRIPT
-- Run this block on the EXISTING Supabase database.
-- Safe to run multiple times — all statements use IF NOT EXISTS
-- or ON CONFLICT DO NOTHING.
-- =============================================================

-- 1. Create lookup tables
CREATE TABLE IF NOT EXISTS "puroks" (
  "purok_id"   SERIAL PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "is_active"  boolean NOT NULL DEFAULT true,
  "sort_order" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE IF NOT EXISTS "streets" (
  "street_id"  SERIAL PRIMARY KEY,
  "name"       varchar UNIQUE NOT NULL,
  "is_active"  boolean NOT NULL DEFAULT true,
  "sort_order" smallint NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

-- 2. Seed lookup tables
INSERT INTO puroks (name, sort_order) VALUES
  ('Purok 1',1),('Purok 2',2),('Purok 3',3),('Purok 4',4),
  ('Purok 5',5),('Purok 6',6),('Purok 7',7),('Purok 8',8),
  ('Purok 9',9),('Purok 10',10),('Purok 11',11),('Purok 12',12)
ON CONFLICT (name) DO NOTHING;

INSERT INTO streets (name, sort_order) VALUES
  ('1st Street',1),('2nd Street',2),('3rd Street',3),('4th Street',4),
  ('5th Street',5),('6th Street',6),('7th Street',7),('8th Street',8),
  ('9th Street',9),('10th Street',10),('11th Street',11),('12th Street',12),
  ('13th Street',13),('14th Street',14),('15th Street',15),
  ('Aguinaldo Street',16),('Ambrosio Padilla Street',17),
  ('Burgos Street',18),('Del Pilar Street',19),('Gallagher Street',20),
  ('Luna Street',21),('Mabini Street',22),('Rizal Street',23)
ON CONFLICT (name) DO NOTHING;

-- 3. Add new columns to residents
ALTER TABLE residents ADD COLUMN IF NOT EXISTS first_name    varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS middle_name   varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_name     varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS house_number  varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS purok_id      int;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS street_id     int;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS street_other  varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS id_type       varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS id_image_url  varchar;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS verified_by   int;
ALTER TABLE residents ADD COLUMN IF NOT EXISTS verified_at   timestamp;

-- 4. Back-fill first_name from full_name for existing rows
UPDATE residents SET first_name = full_name WHERE first_name IS NULL;

-- 5. Change default status for all new registrations
ALTER TABLE residents ALTER COLUMN status SET DEFAULT 'pending_verification';

-- 6. Add foreign keys (safe — uses IF NOT EXISTS constraint names)
ALTER TABLE residents
  ADD CONSTRAINT IF NOT EXISTS fk_residents_purok_id
  FOREIGN KEY (purok_id) REFERENCES puroks(purok_id) DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE residents
  ADD CONSTRAINT IF NOT EXISTS fk_residents_street_id
  FOREIGN KEY (street_id) REFERENCES streets(street_id) DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE residents
  ADD CONSTRAINT IF NOT EXISTS fk_residents_verified_by
  FOREIGN KEY (verified_by) REFERENCES admin_accounts(admin_id) DEFERRABLE INITIALLY IMMEDIATE;


-- =============================================================
-- BACKEND NOTE FOR HARRY
-- =============================================================
--
-- 1. New endpoint needed:
--    GET /api/address-options
--    → { puroks: [{purok_id, name},...], streets: [{street_id, name},...] }
--    Query: SELECT purok_id, name FROM puroks WHERE is_active = true ORDER BY sort_order
--    Frontend dropdowns will call this instead of using hardcoded arrays.
--
-- 2. On POST /api/auth/resident/register, body now includes:
--    first_name, middle_name (optional), last_name,
--    house_number, purok_id (int), street_id (int or null),
--    street_other (string or null)
--
-- 3. In residentController.js, compose the legacy strings on every save:
--
--    const purok  = await pool.query('SELECT name FROM puroks  WHERE purok_id  = $1', [purok_id]);
--    const street = street_id
--      ? await pool.query('SELECT name FROM streets WHERE street_id = $1', [street_id])
--      : null;
--    const streetName  = street?.rows[0]?.name ?? street_other ?? '';
--    const purokName   = purok.rows[0]?.name   ?? '';
--    const full_name   = [first_name, middle_name, last_name].filter(Boolean).join(' ');
--    const address_house  = `${house_number}, ${purokName}`;
--    const address_street = `${streetName}, Barangay East Tapinac, Olongapo City`;
--
-- 4. ResidentProfile page address edit should also send purok_id / street_id
--    instead of plain text strings going forward.
--
-- =============================================================
