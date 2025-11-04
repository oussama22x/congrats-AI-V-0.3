-- ============================================
-- CONGRATS AI - AUDITIONS DATABASE SCHEMA
-- Separate Supabase Project for Audition System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: opportunities
-- Stores job opportunities/auditions
-- ============================================
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Full-time', 'Contract', 'Part-time'
    rate TEXT NOT NULL, -- e.g. '$80-100/hr'
    skills JSONB DEFAULT '[]'::jsonb, -- Array of skill strings
    questions JSONB DEFAULT '[]'::jsonb, -- Array of question strings
    status TEXT DEFAULT 'active', -- 'active', 'closed', 'draft'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID, -- Reference to user who created (for admin)
    closes_at TIMESTAMPTZ -- Optional deadline
);

-- Index for active opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- ============================================
-- TABLE: audition_submissions
-- Stores user submissions for auditions
-- ============================================
CREATE TABLE IF NOT EXISTS public.audition_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- From main auth system
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    
    -- Submission data
    questions JSONB NOT NULL, -- Array of question texts submitted
    audio_urls JSONB NOT NULL, -- Array of {question_index, audio_url, file_path}
    
    -- Metadata
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID, -- Who reviewed it
    
    -- Additional info
    duration_seconds INTEGER, -- Total time taken
    user_agent TEXT, -- Browser info for tracking
    ip_address TEXT, -- For security
    
    -- Constraints
    UNIQUE(user_id, opportunity_id) -- One submission per user per opportunity
);

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.audition_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_opportunity_id ON public.audition_submissions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.audition_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.audition_submissions(submitted_at DESC);

-- ============================================
-- TABLE: proctoring_snapshots
-- Stores camera snapshots for proctoring
-- ============================================
CREATE TABLE IF NOT EXISTS public.proctoring_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.audition_submissions(id) ON DELETE CASCADE,
    snapshot_url TEXT NOT NULL, -- URL to image in storage
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Additional data like device info
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_proctoring_submission_id ON public.proctoring_snapshots(submission_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_snapshots ENABLE ROW LEVEL SECURITY;

-- OPPORTUNITIES POLICIES
-- Anyone can view active opportunities
CREATE POLICY "Anyone can view active opportunities"
    ON public.opportunities
    FOR SELECT
    USING (status = 'active');

-- Only authenticated users can insert (for testing, adjust for production)
CREATE POLICY "Authenticated users can create opportunities"
    ON public.opportunities
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- SUBMISSIONS POLICIES
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
    ON public.audition_submissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can create own submissions"
    ON public.audition_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users cannot update submissions after creation (immutable)
-- Admins would need service role to update

-- PROCTORING POLICIES
-- Users can view snapshots for their submissions
CREATE POLICY "Users can view own proctoring snapshots"
    ON public.proctoring_snapshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.audition_submissions
            WHERE audition_submissions.id = proctoring_snapshots.submission_id
            AND audition_submissions.user_id = auth.uid()
        )
    );

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================

-- Create storage bucket for audio recordings
-- Run this in Supabase SQL Editor:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('audition-recordings', 'audition-recordings', false)
ON CONFLICT (id) DO NOTHING;
*/

-- Storage policies for audio recordings
-- Users can upload to their own folder
/*
CREATE POLICY "Users can upload own recordings"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'audition-recordings'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own recordings"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'audition-recordings'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/

-- ============================================
-- SEED DATA - Sample Opportunities
-- ============================================

INSERT INTO public.opportunities (title, company, location, type, rate, skills, questions, status)
VALUES 
    (
        'Backend Engineer',
        'Vetted AI',
        'Remote (Global)',
        'Contract',
        '$90/hr',
        '["Node.js", "Supabase", "Express", "PostgreSQL"]'::jsonb,
        '[
            "Tell us about a project you are proud of.",
            "How do you structure scalable APIs?",
            "Explain a time you optimized backend performance."
        ]'::jsonb,
        'active'
    ),
    (
        'Frontend Developer',
        'CongratsAI',
        'Remote (Europe)',
        'Full-time',
        '$70/hr',
        '["React", "Tailwind", "TypeScript", "Next.js"]'::jsonb,
        '[
            "Describe your approach to responsive design.",
            "How do you handle component state efficiently?",
            "Show us your favorite UI you built."
        ]'::jsonb,
        'active'
    ),
    (
        'ML Engineer',
        'VisionFlow',
        'Hybrid (Paris)',
        'Contract',
        '$100/hr',
        '["Python", "TensorFlow", "FastAPI", "Docker"]'::jsonb,
        '[
            "How do you preprocess large datasets?",
            "What is your experience with production ML pipelines?",
            "How do you handle model versioning?"
        ]'::jsonb,
        'active'
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for opportunities table
CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (Optional - for easier queries)
-- ============================================

-- View for submissions with opportunity details
CREATE OR REPLACE VIEW public.submissions_with_opportunities AS
SELECT 
    s.id,
    s.user_id,
    s.status,
    s.submitted_at,
    s.reviewed_at,
    o.title,
    o.company,
    o.location,
    o.type,
    o.rate,
    s.audio_urls,
    s.questions
FROM public.audition_submissions s
JOIN public.opportunities o ON s.opportunity_id = o.id;

-- ============================================
-- COMPLETED!
-- ============================================

-- To apply this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- 5. Verify all tables are created in the Table Editor
