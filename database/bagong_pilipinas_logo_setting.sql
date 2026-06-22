-- Adds the configurable Bagong Pilipinas logo used by BRGY.CERT# 3 templates.
-- The Settings page can replace this value with an optimized uploaded image.

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES ('bagong_pilipinas_logo_url', '/bagong-pilipinas-logo.png')
ON CONFLICT (setting_key) DO NOTHING;
