-- Performance indexes for high-volume resident and request lists.
-- Run this in the Supabase SQL Editor after the existing CertiFast migrations.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Admin/resident request feeds and detail drawers.
CREATE INDEX IF NOT EXISTS requests_requested_at_idx
    ON public.requests (requested_at DESC, request_id DESC);

CREATE INDEX IF NOT EXISTS requests_status_requested_at_idx
    ON public.requests (status, requested_at DESC, request_id DESC);

CREATE INDEX IF NOT EXISTS requests_resident_requested_at_idx
    ON public.requests (resident_id, requested_at DESC, request_id DESC);

CREATE INDEX IF NOT EXISTS requests_cert_type_idx
    ON public.requests (cert_type);

CREATE INDEX IF NOT EXISTS requests_cert_type_trgm_idx
    ON public.requests USING gin (cert_type gin_trgm_ops);

CREATE INDEX IF NOT EXISTS requests_purpose_trgm_idx
    ON public.requests USING gin (purpose gin_trgm_ops);

-- Admin resident records list and search.
CREATE INDEX IF NOT EXISTS residents_status_created_at_idx
    ON public.residents (status, created_at DESC, resident_id DESC);

CREATE INDEX IF NOT EXISTS residents_created_at_idx
    ON public.residents (created_at DESC, resident_id DESC);

CREATE INDEX IF NOT EXISTS residents_full_name_trgm_idx
    ON public.residents USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS residents_email_trgm_idx
    ON public.residents USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS residents_address_house_trgm_idx
    ON public.residents USING gin (address_house gin_trgm_ops);

CREATE INDEX IF NOT EXISTS residents_address_street_trgm_idx
    ON public.residents USING gin (address_street gin_trgm_ops);

-- Resident notifications and admin activity feeds.
CREATE INDEX IF NOT EXISTS notifications_resident_created_at_idx
    ON public.notifications (resident_id, created_at DESC, notification_id DESC);

CREATE INDEX IF NOT EXISTS notifications_resident_unread_idx
    ON public.notifications (resident_id, is_read)
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
    ON public.audit_logs (created_at DESC, log_id DESC);

CREATE INDEX IF NOT EXISTS audit_logs_action_target_created_idx
    ON public.audit_logs (action_type, target_table, created_at DESC, log_id DESC);

-- Attachment/history expansion for the current page of requests.
CREATE INDEX IF NOT EXISTS request_attachments_request_order_idx
    ON public.request_attachments (request_id, uploaded_at, request_attachment_id);

CREATE INDEX IF NOT EXISTS request_correction_history_request_order_idx
    ON public.request_correction_history (request_id, created_at, correction_history_id);
