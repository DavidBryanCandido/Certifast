-- Seed resident-facing office hours and ensure the public address exists.
-- Run this in Supabase SQL Editor after the barangay_settings table exists.

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES
    ('office_schedule_line_1_label', 'Mon - Thu'),
    ('office_schedule_line_1_time', '8:00 AM - 5:00 PM'),
    ('office_schedule_line_2_label', 'Friday'),
    ('office_schedule_line_2_time', 'Closed'),
    ('office_schedule_line_3_label', 'Sat, Sun & Hol.'),
    ('office_schedule_line_3_time', 'Closed')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

INSERT INTO barangay_settings (setting_key, setting_value)
VALUES
    ('brgy_address', '54 - 14th Street corner Gallagher Street, Olongapo City')
ON CONFLICT (setting_key) DO NOTHING;
