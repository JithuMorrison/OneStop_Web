-- SSN Connect Portal - Initial Database Schema
-- This migration creates all tables, RLS policies, indexes, and storage buckets
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================================================
-- TABLES
-- ============================================================================
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    email TEXT UNIQUE NOT NULL,
    roll_number TEXT,
    digital_id TEXT NOT NULL,
    department TEXT NOT NULL,
    join_year INTEGER NOT NULL,
    section TEXT,
    followers TEXT [] DEFAULT '{}',
    following TEXT [] DEFAULT '{}',
    liked TEXT [] DEFAULT '{}',
    registered_events TEXT [] DEFAULT '{}',
    badges TEXT [] DEFAULT '{}',
    streak INTEGER DEFAULT 0,
    achievements TEXT [] DEFAULT '{}',
    posts TEXT [] DEFAULT '{}',
    announcements TEXT [] DEFAULT '{}',
    materials TEXT [] DEFAULT '{}',
    chats TEXT [] DEFAULT '{}',
    contacts TEXT [] DEFAULT '{}',
    ods TEXT [] DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT student_roll_number_check CHECK (
        (
            role = 'student'
            AND roll_number IS NOT NULL
            AND LENGTH(roll_number) = 13
        )
        OR (role != 'student')
    )
);
-- Clubs table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    description TEXT NOT NULL,
    subdomains TEXT [] DEFAULT '{}',
    members JSONB DEFAULT '[]',
    moderators JSONB DEFAULT '[]',
    works_done TEXT [] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    additional_images TEXT [] DEFAULT '{}',
    hashtag TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    likes INTEGER DEFAULT 0,
    liked_by TEXT [] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    registration_enabled BOOLEAN DEFAULT FALSE,
    registration_fields TEXT [] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    visibility TEXT NOT NULL CHECK (
        visibility IN ('students', 'teachers', 'everyone')
    ),
    hashtags TEXT [] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    likes INTEGER DEFAULT 0,
    liked_by TEXT [] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT,
    external_link TEXT,
    uploaded_by UUID REFERENCES users(id),
    likes INTEGER DEFAULT 0,
    liked_by TEXT [] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT material_source_check CHECK (
        (file_url IS NOT NULL)
        OR (external_link IS NOT NULL)
    )
);
-- OD Claims table
CREATE TABLE od_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    event_id UUID,
    event_name TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('announcement', 'exam_schedule')),
    source_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Exam Schedules table
CREATE TABLE exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL,
    date DATE NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    number_of_exams INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Chat Threads table
CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants TEXT [] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL CHECK (
        type IN (
            'like',
            'comment',
            'announcement',
            'od_status',
            'event_reminder',
            'message',
            'query_response',
            'share'
        )
    ),
    content TEXT NOT NULL,
    related_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Queries table
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_by UUID REFERENCES users(id),
    submitter_role TEXT NOT NULL CHECK (submitter_role IN ('student', 'teacher')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Portals table
CREATE TABLE portals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    external_link TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tools table
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    external_link TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    data JSONB NOT NULL,
    badge_issued BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);
-- ============================================================================
-- INDEXES
-- ============================================================================
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_digital_id ON users(digital_id);
CREATE INDEX idx_users_roll_number ON users(roll_number)
WHERE roll_number IS NOT NULL;
-- Clubs indexes
CREATE INDEX idx_clubs_created_by ON clubs(created_by);
-- Announcements indexes
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
-- Posts indexes
CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
-- Materials indexes
CREATE INDEX idx_materials_uploaded_by ON materials(uploaded_by);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);
-- OD Claims indexes
CREATE INDEX idx_od_claims_student_id ON od_claims(student_id);
CREATE INDEX idx_od_claims_teacher_id ON od_claims(teacher_id);
CREATE INDEX idx_od_claims_status ON od_claims(status);
-- Events indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_source_type ON events(source_type);
CREATE INDEX idx_events_source_id ON events(source_id);
-- Exam Schedules indexes
CREATE INDEX idx_exam_schedules_date ON exam_schedules(date);
CREATE INDEX idx_exam_schedules_created_by ON exam_schedules(created_by);
-- Chat Threads indexes
CREATE INDEX idx_chat_threads_participants ON chat_threads USING GIN(participants);
-- Messages indexes
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
-- Queries indexes
CREATE INDEX idx_queries_submitted_by ON queries(submitted_by);
CREATE INDEX idx_queries_status ON queries(status);
-- Registrations indexes
CREATE INDEX idx_registrations_announcement_id ON registrations(announcement_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE od_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================
-- Users can read all user profiles
CREATE POLICY "Users can read all profiles" ON users FOR
SELECT USING (true);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id);
-- Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile" ON users FOR
INSERT WITH CHECK (auth.uid() = id);
-- Admin can update any user
CREATE POLICY "Admin can update any user" ON users FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ============================================================================
-- CLUBS TABLE POLICIES
-- ============================================================================
-- All users can read clubs
CREATE POLICY "All users can read clubs" ON clubs FOR
SELECT USING (true);
-- Only admin can create clubs
CREATE POLICY "Only admin can create clubs" ON clubs FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Moderators can update their clubs
CREATE POLICY "Moderators can update their clubs" ON clubs FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(moderators) AS mod
            WHERE (mod->>'userId')::UUID = auth.uid()
        )
    );
-- ============================================================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================================================
-- All users can read announcements
CREATE POLICY "All users can read announcements" ON announcements FOR
SELECT USING (true);
-- Students and teachers can create announcements
CREATE POLICY "Students and teachers can create announcements" ON announcements FOR
INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role IN ('student', 'teacher')
        )
    );
-- Only creator can update their announcements
CREATE POLICY "Creator can update own announcements" ON announcements FOR
UPDATE USING (auth.uid() = created_by);
-- Only creator can delete their announcements
CREATE POLICY "Creator can delete own announcements" ON announcements FOR DELETE USING (auth.uid() = created_by);
-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================
-- Users can read posts based on visibility
CREATE POLICY "Users can read posts based on visibility" ON posts FOR
SELECT USING (
        visibility = 'everyone'
        OR (
            visibility = 'students'
            AND EXISTS (
                SELECT 1
                FROM users
                WHERE id = auth.uid()
                    AND role = 'student'
            )
        )
        OR (
            visibility = 'teachers'
            AND EXISTS (
                SELECT 1
                FROM users
                WHERE id = auth.uid()
                    AND role = 'teacher'
            )
        )
    );
-- Any authenticated user can create posts
CREATE POLICY "Authenticated users can create posts" ON posts FOR
INSERT WITH CHECK (auth.uid() = created_by);
-- Only creator can update their posts
CREATE POLICY "Creator can update own posts" ON posts FOR
UPDATE USING (auth.uid() = created_by);
-- Only creator can delete their posts
CREATE POLICY "Creator can delete own posts" ON posts FOR DELETE USING (auth.uid() = created_by);
-- ============================================================================
-- MATERIALS TABLE POLICIES
-- ============================================================================
-- All users can read materials
CREATE POLICY "All users can read materials" ON materials FOR
SELECT USING (true);
-- Any authenticated user can upload materials
CREATE POLICY "Authenticated users can upload materials" ON materials FOR
INSERT WITH CHECK (auth.uid() = uploaded_by);
-- Only uploader can update their materials
CREATE POLICY "Uploader can update own materials" ON materials FOR
UPDATE USING (auth.uid() = uploaded_by);
-- Only uploader can delete their materials
CREATE POLICY "Uploader can delete own materials" ON materials FOR DELETE USING (auth.uid() = uploaded_by);
-- ============================================================================
-- OD CLAIMS TABLE POLICIES
-- ============================================================================
-- Students can read their own OD claims
CREATE POLICY "Students can read own OD claims" ON od_claims FOR
SELECT USING (auth.uid() = student_id);
-- Teachers can read OD claims where they are tagged
CREATE POLICY "Teachers can read tagged OD claims" ON od_claims FOR
SELECT USING (auth.uid() = teacher_id);
-- Students can create OD claims
CREATE POLICY "Students can create OD claims" ON od_claims FOR
INSERT WITH CHECK (
        auth.uid() = student_id
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'student'
        )
    );
-- Teachers can update status of OD claims where they are tagged
CREATE POLICY "Teachers can update tagged OD claims" ON od_claims FOR
UPDATE USING (
        auth.uid() = teacher_id
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'teacher'
        )
    );
-- ============================================================================
-- EVENTS TABLE POLICIES
-- ============================================================================
-- All users can read events
CREATE POLICY "All users can read events" ON events FOR
SELECT USING (true);
-- System can create events (via triggers or service role)
CREATE POLICY "System can create events" ON events FOR
INSERT WITH CHECK (true);
-- Teachers can create events for exam schedules
CREATE POLICY "Teachers can create events" ON events FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'teacher'
        )
    );
-- ============================================================================
-- EXAM SCHEDULES TABLE POLICIES
-- ============================================================================
-- All users can read exam schedules
CREATE POLICY "All users can read exam schedules" ON exam_schedules FOR
SELECT USING (true);
-- Teachers can create exam schedules
CREATE POLICY "Teachers can create exam schedules" ON exam_schedules FOR
INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'teacher'
        )
    );
-- Teachers can update their own exam schedules
CREATE POLICY "Teachers can update own exam schedules" ON exam_schedules FOR
UPDATE USING (auth.uid() = created_by);
-- ============================================================================
-- CHAT THREADS TABLE POLICIES
-- ============================================================================
-- Users can read chat threads they participate in
CREATE POLICY "Users can read own chat threads" ON chat_threads FOR
SELECT USING (auth.uid()::TEXT = ANY(participants));
-- Users can create chat threads
CREATE POLICY "Users can create chat threads" ON chat_threads FOR
INSERT WITH CHECK (auth.uid()::TEXT = ANY(participants));
-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================
-- Users can read messages in their chat threads
CREATE POLICY "Users can read messages in their threads" ON messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM chat_threads
            WHERE id = thread_id
                AND auth.uid()::TEXT = ANY(participants)
        )
    );
-- Users can send messages in their chat threads
CREATE POLICY "Users can send messages in their threads" ON messages FOR
INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1
            FROM chat_threads
            WHERE id = thread_id
                AND auth.uid()::TEXT = ANY(participants)
        )
    );
-- Users can update read status of messages
CREATE POLICY "Users can update message read status" ON messages FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM chat_threads
            WHERE id = thread_id
                AND auth.uid()::TEXT = ANY(participants)
        )
    );
-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================
-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications FOR
SELECT USING (auth.uid() = user_id);
-- System can create notifications (via triggers or service role)
CREATE POLICY "System can create notifications" ON notifications FOR
INSERT WITH CHECK (true);
-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (auth.uid() = user_id);
-- ============================================================================
-- QUERIES TABLE POLICIES
-- ============================================================================
-- Students and teachers can create queries
CREATE POLICY "Students and teachers can create queries" ON queries FOR
INSERT WITH CHECK (
        auth.uid() = submitted_by
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role IN ('student', 'teacher')
        )
    );
-- Users can read their own queries
CREATE POLICY "Users can read own queries" ON queries FOR
SELECT USING (auth.uid() = submitted_by);
-- Admin can read all queries
CREATE POLICY "Admin can read all queries" ON queries FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Admin can respond to queries
CREATE POLICY "Admin can respond to queries" ON queries FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- ============================================================================
-- PORTALS TABLE POLICIES
-- ============================================================================
-- All users can read portals
CREATE POLICY "All users can read portals" ON portals FOR
SELECT USING (true);
-- Only admin can create portals
CREATE POLICY "Only admin can create portals" ON portals FOR
INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Only admin can update portals
CREATE POLICY "Only admin can update portals" ON portals FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Only admin can delete portals
CREATE POLICY "Only admin can delete portals" ON portals FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ============================================================================
-- TOOLS TABLE POLICIES
-- ============================================================================
-- All users can read tools
CREATE POLICY "All users can read tools" ON tools FOR
SELECT USING (true);
-- Only admin can create tools
CREATE POLICY "Only admin can create tools" ON tools FOR
INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Only admin can update tools
CREATE POLICY "Only admin can update tools" ON tools FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Only admin can delete tools
CREATE POLICY "Only admin can delete tools" ON tools FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ============================================================================
-- REGISTRATIONS TABLE POLICIES
-- ============================================================================
-- Users can read their own registrations
CREATE POLICY "Users can read own registrations" ON registrations FOR
SELECT USING (auth.uid() = user_id);
-- Announcement creators can read registrations for their announcements
CREATE POLICY "Creators can read announcement registrations" ON registrations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM announcements
            WHERE id = announcement_id
                AND created_by = auth.uid()
        )
    );
-- Users can create registrations
CREATE POLICY "Users can create registrations" ON registrations FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Announcement creators can update registrations (for badge issuance)
CREATE POLICY "Creators can update registrations" ON registrations FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM announcements
            WHERE id = announcement_id
                AND created_by = auth.uid()
        )
    );
-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- The following are the bucket configurations needed:
-- Bucket: announcement-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- Bucket: post-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- Bucket: material-files
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- Bucket: club-logos
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/svg+xml
-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE
UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE
UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE
UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE
UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_od_claims_updated_at BEFORE
UPDATE ON od_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE
UPDATE ON chat_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();