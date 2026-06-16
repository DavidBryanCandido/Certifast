# Supabase Public Tables and Columns

Generated: 2026-05-26 14:42:54 Asia/Singapore
Schema: `public`
Tables: 10

## public.admin_accounts

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | admin_id | integer | NO | nextval('admin_accounts_admin_id_seq'::regclass) |
| 2 | full_name | character varying | NO |  |
| 3 | username | character varying | NO |  |
| 4 | password_hash | character varying | NO |  |
| 5 | role | character varying | NO |  |
| 6 | status | character varying | YES | 'active'::character varying |
| 7 | created_at | timestamp without time zone | YES | now() |
| 8 | last_login | timestamp without time zone | YES |  |
| 9 | email | character varying | YES |  |

## public.audit_logs

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | log_id | integer | NO | nextval('audit_logs_log_id_seq'::regclass) |
| 2 | actor_id | integer | YES |  |
| 3 | actor_name | character varying | YES |  |
| 4 | actor_role | character varying | YES |  |
| 5 | action_type | character varying | NO |  |
| 6 | target_table | character varying | YES |  |
| 7 | target_id | integer | YES |  |
| 8 | description | text | YES |  |
| 9 | ip_address | character varying | YES |  |
| 10 | created_at | timestamp without time zone | YES | now() |

## public.barangay_settings

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | setting_key | varchar(100) | NO |  |
| 2 | setting_value | text | YES |  |
| 3 | updated_at | timestamp without time zone | YES | now() |
| 4 | updated_by | integer | YES |  |

## public.certificate_templates

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | template_id | integer | NO | nextval('certificate_templates_template_id_seq'::regclass) |
| 2 | name | character varying | NO |  |
| 3 | has_fee | boolean | YES | false |
| 4 | description | text | YES |  |
| 5 | is_active | boolean | YES | true |
| 6 | created_at | timestamp without time zone | YES | now() |
| 7 | template_key | text | YES |  |
| 8 | variant_label | text | YES |  |
| 9 | doc_source | text | YES | 'doc1'::text |
| 10 | display_order | integer | YES | 0 |
| 11 | required_fields | jsonb | YES | '[]'::jsonb |
| 12 | fee_amount | numeric(10,2) | YES |  |

## public.issued_certificates

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | certificate_id | integer | NO | nextval('issued_certificates_certificate_id_seq'::regclass) |
| 2 | request_id | integer | YES |  |
| 3 | doc_id | character varying | NO |  |
| 4 | cert_type | character varying | NO |  |
| 5 | resident_name | character varying | NO |  |
| 6 | address | text | YES |  |
| 7 | purpose | character varying | YES |  |
| 8 | issued_by | integer | YES |  |
| 9 | issued_at | timestamp without time zone | YES | now() |
| 10 | source | character varying | YES |  |
| 11 | qr_code_data | text | YES |  |
| 12 | template_id | integer | YES |  |
| 13 | extra_fields | jsonb | YES | '{}'::jsonb |

## public.notifications

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | notification_id | integer | NO | nextval('notifications_notification_id_seq'::regclass) |
| 2 | resident_id | integer | YES |  |
| 3 | type | character varying | NO |  |
| 4 | title | character varying | NO |  |
| 5 | message | text | YES |  |
| 6 | request_id | integer | YES |  |
| 7 | is_read | boolean | YES | false |
| 8 | created_at | timestamp without time zone | YES | now() |

## public.puroks

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | purok_id | integer | NO | nextval('puroks_purok_id_seq'::regclass) |
| 2 | name | character varying | NO |  |
| 3 | is_active | boolean | NO | true |
| 4 | sort_order | smallint | NO | 0 |
| 5 | created_at | timestamp without time zone | NO | now() |

## public.requests

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | request_id | integer | NO | nextval('requests_request_id_seq'::regclass) |
| 2 | resident_id | integer | YES |  |
| 3 | template_id | integer | YES |  |
| 4 | cert_type | character varying | NO |  |
| 5 | purpose | character varying | YES |  |
| 6 | extra_fields | jsonb | YES |  |
| 7 | notes | text | YES |  |
| 8 | source | character varying | YES |  |
| 9 | status | character varying | YES | 'pending'::character varying |
| 10 | rejection_reason | text | YES |  |
| 11 | requested_at | timestamp without time zone | YES | now() |
| 12 | processed_by | integer | YES |  |
| 13 | processed_at | timestamp without time zone | YES |  |
| 14 | released_by | integer | YES |  |
| 15 | released_at | timestamp without time zone | YES |  |
| 16 | denial_category | text | YES |  |

## public.residents

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | resident_id | integer | NO | nextval('residents_resident_id_seq'::regclass) |
| 2 | full_name | character varying | NO |  |
| 3 | email | character varying | NO |  |
| 4 | password_hash | character varying | NO |  |
| 5 | contact_number | character varying | YES |  |
| 6 | address_house | character varying | YES |  |
| 7 | address_street | character varying | YES |  |
| 8 | date_of_birth | date | YES |  |
| 9 | civil_status | character varying | YES |  |
| 10 | status | character varying | YES | 'pending_verification'::character varying |
| 11 | created_at | timestamp without time zone | YES | now() |
| 12 | first_name | character varying | YES |  |
| 13 | middle_name | character varying | YES |  |
| 14 | last_name | character varying | YES |  |
| 15 | house_number | character varying | YES |  |
| 16 | purok_id | integer | YES |  |
| 17 | street_id | integer | YES |  |
| 18 | street_other | character varying | YES |  |
| 19 | id_type | character varying | YES |  |
| 20 | id_image_url | character varying | YES |  |
| 21 | verified_by | integer | YES |  |
| 22 | verified_at | timestamp without time zone | YES |  |
| 23 | nationality | character varying | YES | 'Filipino'::character varying |
| 24 | rejection_comment | text | YES |  |
| 25 | gender | character varying | YES |  |
| 26 | place_of_birth | character varying | YES |  |
| 27 | occupation | character varying | YES |  |
| 28 | years_of_residency | integer | YES |  |
| 29 | profile_details | jsonb | YES | '{}'::jsonb |

## public.streets

| # | Column | Data type | Nullable | Default |
|---:|---|---|---|---|
| 1 | street_id | integer | NO | nextval('streets_street_id_seq'::regclass) |
| 2 | name | character varying | NO |  |
| 3 | is_active | boolean | NO | true |
| 4 | sort_order | smallint | NO | 0 |
| 5 | created_at | timestamp without time zone | NO | now() |
