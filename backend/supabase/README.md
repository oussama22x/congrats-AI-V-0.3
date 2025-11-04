# Auditions Supabase Database Setup

This folder contains the database schema and configuration for the **Auditions System** - a separate Supabase project from the main CongratsAI platform.

## 🗄️ Database Information

**Project URL:** `https://uvszvjbzcvkgktrvavqe.supabase.co`  
**Project Name:** congrats-auditions (or as named in your dashboard)

## 📋 Setup Instructions

### Step 1: Apply Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your auditions project: `uvszvjbzcvkgktrvavqe`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy the entire contents of [`schema.sql`](schema.sql)
6. Paste into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)

**Expected Result:**
- ✅ 3 tables created: `opportunities`, `audition_submissions`, `proctoring_snapshots`
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ 3 sample opportunities inserted

### Step 2: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Configure:
   - **Name:** `audition-recordings`
   - **Public:** ❌ OFF (keep private)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `audio/webm, audio/wav, audio/mp4`
4. Click **"Create Bucket"**

### Step 3: Configure Storage Policies

1. Click on the `audition-recordings` bucket
2. Go to **Policies** tab
3. Add the following policies:

**Policy 1: Upload Own Recordings**
```sql
CREATE POLICY "Users can upload own recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'audition-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: View Own Recordings**
```sql
CREATE POLICY "Users can view own recordings"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'audition-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 4: Verify Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('opportunities', 'audition_submissions', 'proctoring_snapshots');

-- Check if opportunities have data
SELECT COUNT(*) as total_opportunities FROM public.opportunities;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'audition-recordings';
```

Expected results:
- 3 tables listed
- 3 opportunities count
- 1 storage bucket

## 🗂️ Database Schema

### Tables

#### `opportunities`
Stores job opportunities/auditions that users can apply to.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Job title (e.g. "Backend Engineer") |
| company | TEXT | Company name |
| location | TEXT | Job location |
| type | TEXT | Employment type |
| rate | TEXT | Hourly rate |
| skills | JSONB | Array of required skills |
| questions | JSONB | Array of audition questions |
| status | TEXT | 'active', 'closed', 'draft' |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `audition_submissions`
Stores user submissions for auditions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who submitted |
| opportunity_id | UUID | Reference to opportunity |
| questions | JSONB | Questions that were answered |
| audio_urls | JSONB | Array of audio file URLs |
| status | TEXT | 'pending', 'reviewing', 'approved', 'rejected' |
| submitted_at | TIMESTAMPTZ | Submission timestamp |
| reviewed_at | TIMESTAMPTZ | Review timestamp |

#### `proctoring_snapshots`
Stores camera snapshots for proctoring.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| submission_id | UUID | Reference to submission |
| snapshot_url | TEXT | URL to image in storage |
| captured_at | TIMESTAMPTZ | Capture timestamp |

## 🔒 Security (RLS Policies)

**Opportunities:**
- ✅ Anyone can view active opportunities
- ✅ Only authenticated users can create opportunities

**Submissions:**
- ✅ Users can only view their own submissions
- ✅ Users can only create their own submissions
- ❌ Users cannot update submissions (immutable)

**Storage:**
- ✅ Users can upload to their own folder: `{user_id}/...`
- ✅ Users can only view their own recordings

## 🧪 Testing the Setup

### Test 1: Fetch Opportunities
```javascript
const { data, error } = await supabase
  .from('opportunities')
  .select('*')
  .eq('status', 'active');

console.log(data); // Should return 3 opportunities
```

### Test 2: Create Submission (requires auth)
```javascript
const { data, error } = await supabase
  .from('audition_submissions')
  .insert({
    user_id: 'user-uuid-here',
    opportunity_id: 'opportunity-uuid-here',
    questions: ['Q1', 'Q2', 'Q3'],
    audio_urls: [{question_index: 0, audio_url: '...'}]
  });
```

### Test 3: Upload Audio File
```javascript
const { data, error } = await supabase.storage
  .from('audition-recordings')
  .upload(`${userId}/submission-123/answer_0.webm`, audioBlob);
```

## 🚀 Backend Integration

The backend server is already configured to use this database. Check [`../.env`](../.env):

```env
SUPABASE_URL=https://uvszvjbzcvkgktrvavqe.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

The `supabase` client in [`../server.js`](../server.js) is connected to this project.

## 📊 Monitoring

**Dashboard URLs:**
- **Tables:** https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/editor
- **Storage:** https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/storage/buckets
- **SQL Editor:** https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/sql
- **Auth:** https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/auth/users

## 🔧 Maintenance

### Add New Opportunity
```sql
INSERT INTO public.opportunities (title, company, location, type, rate, skills, questions)
VALUES (
    'New Role',
    'Company Name',
    'Remote',
    'Full-time',
    '$80/hr',
    '["Skill1", "Skill2"]'::jsonb,
    '["Question 1?", "Question 2?"]'::jsonb
);
```

### View All Submissions
```sql
SELECT 
    s.id,
    s.user_id,
    o.title as job_title,
    o.company,
    s.status,
    s.submitted_at
FROM audition_submissions s
JOIN opportunities o ON s.opportunity_id = o.id
ORDER BY s.submitted_at DESC;
```

### Update Submission Status
```sql
UPDATE audition_submissions
SET status = 'approved', reviewed_at = NOW()
WHERE id = 'submission-uuid-here';
```

## ❗ Important Notes

1. **Separate from Main App:** This database is completely separate from the main CongratsAI vetting platform
2. **User IDs:** User authentication still happens in the main project, but submissions are stored here
3. **Storage Costs:** Audio files count toward your Supabase storage quota
4. **RLS Security:** Row-level security is enabled - users can only see their own data

## 🆘 Troubleshooting

**Error: "relation does not exist"**
- Solution: Run [`schema.sql`](schema.sql) in SQL Editor

**Error: "bucket not found"**
- Solution: Create `audition-recordings` bucket in Storage

**Error: "permission denied"**
- Solution: Check RLS policies are created correctly

**Error: "new row violates row-level security policy"**
- Solution: Make sure you're authenticated when inserting data

---

**Setup Complete!** 🎉

Your auditions database is ready to use. The backend server will automatically connect to this database using the credentials in [`.env`](../.env).
