-- Optional default setting for the CertiFast UI theme.
-- Existing barangay_settings key-value storage is reused.

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES ('system_theme', 'default')
ON CONFLICT (setting_key) DO NOTHING;

