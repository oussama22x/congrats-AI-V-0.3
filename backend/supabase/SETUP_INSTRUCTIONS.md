# ✅ NEW AUDITIONS DATABASE SETUP COMPLETE

## 📁 What Was Created

```
backend/
├── .env                           # ✅ Updated with new Supabase credentials
├── server.js                      # ✅ Already connected to new database
└── supabase/                      # ✅ NEW FOLDER
    ├── README.md                  # Complete setup guide
    ├── schema.sql                 # Database schema to run
    └── test-connection.js         # Test script
```

## 🗄️ Your New Database

**Project URL:** https://uvszvjbzcvkgktrvavqe.supabase.co  
**Purpose:** Dedicated database for the Auditions System  
**Separation:** Completely isolated from main CongratsAI platform

## 🚀 NEXT STEPS (Do These Now!)

### Step 1: Apply Database Schema (5 minutes)

1. Open your browser: https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/sql
2. Click **"New Query"**
3. Open the file: `backend/supabase/schema.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** button

**What this creates:**
- ✅ `opportunities` table (job listings)
- ✅ `audition_submissions` table (user submissions)
- ✅ `proctoring_snapshots` table (camera snapshots)
- ✅ 3 sample opportunities (Backend Engineer, Frontend Developer, ML Engineer)
- ✅ Row-level security policies
- ✅ Indexes for performance

### Step 2: Create Storage Bucket (2 minutes)

1. Go to: https://supabase.com/dashboard/project/uvszvjbzcvkgktrvavqe/storage/buckets
2. Click **"New Bucket"**
3. Settings:
   - Name: `audition-recordings`
   - Public: **OFF** ❌
   - File size limit: `10 MB`
4. Click **"Create Bucket"**
5. Go to the bucket's **Policies** tab
6. Run these SQL commands in SQL Editor:

```sql
-- Allow users to upload their own recordings
CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audition-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own recordings
CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audition-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Test Connection (1 minute)

Run this from your terminal:

```bash
cd backend/supabase
node test-connection.js
```

**Expected output:**
```
✅ Success! Found 3 opportunities:
   1. Backend Engineer at Vetted AI
   2. Frontend Developer at CongratsAI
   3. ML Engineer at VisionFlow
✅ Storage bucket "audition-recordings" exists!
✅ audition_submissions table exists! Current count: 0
✅ proctoring_snapshots table exists! Current count: 0

🎉 ALL TESTS PASSED!
```

## 🔧 Backend Configuration

Your backend is **already configured** to use the new database!

**Check `backend/.env`:**
```env
# New Auditions Database (ACTIVE)
SUPABASE_URL=https://uvszvjbzcvkgktrvavqe.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...

# Old Main Database (for reference)
MAIN_SUPABASE_URL=https://nnfjjhiajdnfmsvcecbg.supabase.co
```

**Check `backend/server.js`:**
```javascript
const supabase = createClient(
  process.env.SUPABASE_URL,  // ← Points to new auditions DB
  process.env.SUPABASE_ANON_KEY
);
```

## ✅ What You Get

### Separate Database Benefits:
- ✅ **Clean separation** - Auditions won't affect main app
- ✅ **Independent scaling** - Can scale auditions separately
- ✅ **Safe testing** - Break things without affecting production
- ✅ **Better organization** - Clear data boundaries
- ✅ **Security** - Different API keys per project

### Database Schema:
- ✅ **opportunities** - Job listings with questions
- ✅ **audition_submissions** - User recordings + metadata
- ✅ **proctoring_snapshots** - Camera verification images
- ✅ **Storage bucket** - Audio file storage (private)

### Security Features:
- ✅ **Row-level security** - Users see only their data
- ✅ **Unique constraints** - One submission per job
- ✅ **Immutable submissions** - Can't edit after submit
- ✅ **Private storage** - Audio files require auth

## 📊 Quick Reference

### Fetch Opportunities (Public)
```javascript
const { data } = await supabase
  .from('opportunities')
  .select('*')
  .eq('status', 'active');
```

### Create Submission (Requires Auth)
```javascript
const { data, error } = await supabase
  .from('audition_submissions')
  .insert({
    user_id: userId,
    opportunity_id: opportunityId,
    questions: ['Q1', 'Q2', 'Q3'],
    audio_urls: [
      { question_index: 0, audio_url: 'url1', file_path: 'path1' },
      { question_index: 1, audio_url: 'url2', file_path: 'path2' },
      { question_index: 2, audio_url: 'url3', file_path: 'path3' }
    ]
  });
```

### Upload Audio File
```javascript
const { data, error } = await supabase.storage
  .from('audition-recordings')
  .upload(`${userId}/${submissionId}/answer_0.webm`, audioBlob);
```

## 🎯 Ready for Next Task!

Once you've completed the 3 steps above, you're ready to:

1. **Update backend endpoints** to save submissions to database
2. **Upload audio files** to Supabase Storage
3. **Fetch real opportunities** from database (not mock data)
4. **Track submission status** (pending → reviewing → approved)

## 🆘 Need Help?

**If schema.sql fails:**
- Check you're in the correct Supabase project
- Make sure UUID extension is enabled
- Check for any existing tables with same names

**If storage policies fail:**
- Run storage policies in SQL Editor, not Storage UI
- Verify bucket name is exactly `audition-recordings`

**If test connection fails:**
- Verify .env has correct SUPABASE_URL and SUPABASE_ANON_KEY
- Restart backend server to load new .env
- Check you ran schema.sql first

---

**Status:** ✅ Database structure created, waiting for you to apply schema!

Run the 3 steps above and let me know when done! 🚀
