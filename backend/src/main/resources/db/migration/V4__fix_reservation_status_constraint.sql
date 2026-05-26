-- V4: Extend reservation status constraint to include ARRIVED and EXPIRED states.
-- These statuses were added to the ReservationStatus enum but were missing
-- from the DB CHECK constraint, causing constraint violations on check-in and expiry.

ALTER TABLE reservations
    DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE reservations
    ADD CONSTRAINT reservations_status_check
    CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'ARRIVED', 'EXPIRED'));
