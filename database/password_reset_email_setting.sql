-- Configurable recipient for administrator password-reset requests.
-- Safe to run more than once in the Supabase SQL Editor.

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES ('password_reset_email', 'it-admin@easttapinac.gov.ph')
ON CONFLICT (setting_key) DO NOTHING;
