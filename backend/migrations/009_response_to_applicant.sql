-- Add response_note column to applications table

ALTER TABLE applications
ADD COLUMN response_note TEXT;
