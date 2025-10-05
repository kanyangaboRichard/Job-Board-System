-- Add updated_at column to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
