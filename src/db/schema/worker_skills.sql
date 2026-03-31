CREATE TABLE worker_skills (
  id SERIAL PRIMARY KEY,
  
  worker_id INTEGER REFERENCES worker_profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,

  UNIQUE(worker_id, skill_id)
);