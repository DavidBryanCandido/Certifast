CREATE TABLE requests (
  request_id integer DEFAULT nextval('requests_request_id_seq'::regclass) NOT NULL,
  resident_id integer,
  template_id integer,
  cert_type character varying NOT NULL,
  purpose character varying,
  extra_fields jsonb,
  notes text,
  source character varying,
  status character varying DEFAULT 'pending'::character varying,
  rejection_reason text,
  requested_at timestamp without time zone DEFAULT now(),
  processed_by integer,
  processed_at timestamp without time zone,
  released_by integer,
  released_at timestamp without time zone,
  denial_category text
);

ALTER TABLE requests ADD PRIMARY KEY (request_id);

ALTER TABLE requests ADD FOREIGN KEY (processed_by) REFERENCES admin_accounts(admin_id);
ALTER TABLE requests ADD FOREIGN KEY (released_by) REFERENCES admin_accounts(admin_id);
ALTER TABLE requests ADD FOREIGN KEY (resident_id) REFERENCES residents(resident_id);
ALTER TABLE requests ADD FOREIGN KEY (template_id) REFERENCES certificate_templates(template_id);

CREATE TABLE certificate_templates (
  template_id integer DEFAULT nextval('certificate_templates_template_id_seq'::regclass) NOT NULL,
  name character varying NOT NULL,
  has_fee boolean DEFAULT false,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE certificate_templates ADD PRIMARY KEY (template_id);


CREATE TABLE admin_accounts (
  admin_id integer DEFAULT nextval('admin_accounts_admin_id_seq'::regclass) NOT NULL,
  full_name character varying NOT NULL,
  username character varying NOT NULL,
  password_hash character varying NOT NULL,
  role character varying NOT NULL,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  last_login timestamp without time zone
);

ALTER TABLE admin_accounts ADD PRIMARY KEY (admin_id);


CREATE TABLE issued_certificates (
  certificate_id integer DEFAULT nextval('issued_certificates_certificate_id_seq'::regclass) NOT NULL,
  request_id integer,
  doc_id character varying NOT NULL,
  cert_type character varying NOT NULL,
  resident_name character varying NOT NULL,
  address text,
  purpose character varying,
  issued_by integer,
  issued_at timestamp without time zone DEFAULT now(),
  source character varying,
  qr_code_data text
);

ALTER TABLE issued_certificates ADD PRIMARY KEY (certificate_id);

ALTER TABLE issued_certificates ADD FOREIGN KEY (issued_by) REFERENCES admin_accounts(admin_id);
ALTER TABLE issued_certificates ADD FOREIGN KEY (request_id) REFERENCES requests(request_id);

CREATE TABLE audit_logs (
  log_id integer DEFAULT nextval('audit_logs_log_id_seq'::regclass) NOT NULL,
  actor_id integer,
  actor_name character varying,
  actor_role character varying,
  action_type character varying NOT NULL,
  target_table character varying,
  target_id integer,
  description text,
  ip_address character varying,
  created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE audit_logs ADD PRIMARY KEY (log_id);

ALTER TABLE audit_logs ADD FOREIGN KEY (actor_id) REFERENCES admin_accounts(admin_id);

CREATE TABLE barangay_settings (
  setting_key character varying NOT NULL,
  setting_value text,
  updated_at timestamp without time zone DEFAULT now(),
  updated_by integer
);

ALTER TABLE barangay_settings ADD PRIMARY KEY (setting_key);

ALTER TABLE barangay_settings ADD FOREIGN KEY (updated_by) REFERENCES admin_accounts(admin_id);

CREATE TABLE notifications (
  notification_id integer DEFAULT nextval('notifications_notification_id_seq'::regclass) NOT NULL,
  resident_id integer,
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text,
  request_id integer,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE notifications ADD PRIMARY KEY (notification_id);

ALTER TABLE notifications ADD FOREIGN KEY (request_id) REFERENCES requests(request_id);
ALTER TABLE notifications ADD FOREIGN KEY (resident_id) REFERENCES residents(resident_id);

CREATE TABLE puroks (
  purok_id integer DEFAULT nextval('puroks_purok_id_seq'::regclass) NOT NULL,
  name character varying NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  sort_order smallint DEFAULT 0 NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE puroks ADD PRIMARY KEY (purok_id);


CREATE TABLE streets (
  street_id integer DEFAULT nextval('streets_street_id_seq'::regclass) NOT NULL,
  name character varying NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  sort_order smallint DEFAULT 0 NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE streets ADD PRIMARY KEY (street_id);


CREATE TABLE residents (
  resident_id integer DEFAULT nextval('residents_resident_id_seq'::regclass) NOT NULL,
  full_name character varying NOT NULL,
  email character varying NOT NULL,
  password_hash character varying NOT NULL,
  contact_number character varying,
  address_house character varying,
  address_street character varying,
  date_of_birth date,
  civil_status character varying,
  status character varying DEFAULT 'pending_verification'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  first_name character varying,
  middle_name character varying,
  last_name character varying,
  house_number character varying,
  purok_id integer,
  street_id integer,
  street_other character varying,
  id_type character varying,
  id_image_url character varying,
  verified_by integer,
  verified_at timestamp without time zone,
  nationality character varying DEFAULT 'Filipino'::character varying
);

ALTER TABLE residents ADD PRIMARY KEY (resident_id);

ALTER TABLE residents ADD FOREIGN KEY (purok_id) REFERENCES puroks(purok_id);
ALTER TABLE residents ADD FOREIGN KEY (street_id) REFERENCES streets(street_id);
ALTER TABLE residents ADD FOREIGN KEY (verified_by) REFERENCES admin_accounts(admin_id);

