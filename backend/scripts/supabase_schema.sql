-- Mentor Bridge schema for Supabase SQL Editor
-- Run at: https://supabase.com/dashboard/project/ljnzbearisnzzonqxjye/sql/new

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS mentorship_requests (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mentorship_requests_id ON mentorship_requests (id);
CREATE INDEX IF NOT EXISTS ix_mentorship_requests_student_id ON mentorship_requests (student_id);
CREATE INDEX IF NOT EXISTS ix_mentorship_requests_alumni_id ON mentorship_requests (alumni_id);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio VARCHAR(1000),
    avatar_url VARCHAR(500),
    graduation_year INTEGER,
    department VARCHAR(255),
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    mentorship_expertise JSONB,
    interests JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_profiles_id ON profiles (id);
CREATE INDEX IF NOT EXISTS ix_profiles_user_id ON profiles (user_id);

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB,
    apply_link VARCHAR(500) NOT NULL,
    category VARCHAR(20) NOT NULL,
    country VARCHAR(100),
    salary_range VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    posted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_jobs_id ON jobs (id);
CREATE INDEX IF NOT EXISTS ix_jobs_posted_by_id ON jobs (posted_by_id);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date VARCHAR(20) NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_events_id ON events (id);
CREATE INDEX IF NOT EXISTS ix_events_organizer_id ON events (organizer_id);

CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_user_rsvp UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS ix_event_rsvps_id ON event_rsvps (id);
CREATE INDEX IF NOT EXISTS ix_event_rsvps_event_id ON event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS ix_event_rsvps_user_id ON event_rsvps (user_id);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_announcements_id ON announcements (id);
CREATE INDEX IF NOT EXISTS ix_announcements_created_by_id ON announcements (created_by_id);

CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);
INSERT INTO alembic_version (version_num) VALUES ('20260605_0002')
ON CONFLICT (version_num) DO NOTHING;
