CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    lang_code VARCHAR(10) UNIQUE NOT NULL, -- 'en', 'es' ...
    lang_name VARCHAR(50) NOT NULL         -- 'English', 'Spanish' ...
);

CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_lang_id INTEGER NOT NULL REFERENCES languages(id),
    target_lang_id INTEGER NOT NULL REFERENCES languages(id),
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    provider VARCHAR(50), -- e.g. 'google', 'openai'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO languages (lang_code, lang_name) VALUES 
('en', 'English'),
('es', 'Spanish'),
('fr', 'French'),
('de', 'German')
ON CONFLICT (lang_code) DO NOTHING;
