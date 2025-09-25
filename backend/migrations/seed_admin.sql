INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2b$10$FJV.wZCZCxe2Ou.7AVAzduKs0kEZOk661VH3pvoYu6QCiboa3I04C',
  'Default Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
