-- Drop the old plaintext password column
ALTER TABLE public.users
DROP COLUMN IF EXISTS password;
