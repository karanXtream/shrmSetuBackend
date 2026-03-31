CREATE TABLE media (
  id SERIAL PRIMARY KEY,

  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(10) CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);