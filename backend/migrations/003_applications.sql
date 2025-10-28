CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cover_letter TEXT,
    cv_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',     -- 'pending' | 'accepted' | 'rejected'
    responseNote TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);
