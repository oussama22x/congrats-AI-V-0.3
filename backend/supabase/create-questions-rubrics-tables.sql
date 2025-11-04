-- ============================================
-- LEMU'S QUESTION BANK & RUBRICS TABLES
-- ============================================

-- ============================================
-- TABLE: questions
-- Stores the master question bank
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY, -- e.g., 'C1', 'C2', 'E1', etc.
    dimension_key TEXT NOT NULL, -- e.g., 'cognitive_analytical', 'execution_reliability'
    type TEXT NOT NULL, -- e.g., 'reasoning_probe', 'micro_simulation', 'simulation', 'deliverable'
    prompt TEXT NOT NULL, -- The actual question text
    time_limit_seconds INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by dimension
CREATE INDEX IF NOT EXISTS idx_questions_dimension_key ON public.questions(dimension_key);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);

-- ============================================
-- TABLE: rubrics
-- Stores the scoring rubrics for each dimension
-- ============================================
CREATE TABLE IF NOT EXISTS public.rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_key TEXT UNIQUE NOT NULL, -- e.g., 'cognitive_analytical'
    weight NUMERIC(4,2) NOT NULL, -- e.g., 0.25 (25%)
    anchor_1 TEXT NOT NULL, -- Level 1 description
    anchor_2 TEXT NOT NULL, -- Level 2 description
    anchor_3 TEXT NOT NULL, -- Level 3 description
    anchor_4 TEXT NOT NULL, -- Level 4 description
    anchor_5 TEXT NOT NULL, -- Level 5 description
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read questions and rubrics (public access)
CREATE POLICY "Anyone can view questions"
    ON public.questions
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view rubrics"
    ON public.rubrics
    FOR SELECT
    USING (true);

-- Only authenticated users with admin role can insert/update/delete
-- (You can adjust this based on your auth setup)
CREATE POLICY "Authenticated users can manage questions"
    ON public.questions
    FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage rubrics"
    ON public.rubrics
    FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.questions IS 'Master question bank for auditions';
COMMENT ON TABLE public.rubrics IS 'Scoring rubrics for evaluating responses by dimension';
COMMENT ON COLUMN public.questions.dimension_key IS 'Links to rubrics.dimension_key for scoring';
COMMENT ON COLUMN public.rubrics.weight IS 'Relative weight of this dimension in overall score (should sum to 1.0)';
