CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    salary NUMERIC,
    location VARCHAR(150),
    company_id INT NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    posted_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
