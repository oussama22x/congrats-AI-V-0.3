# Audition System Refactoring - 30-Minute Exam Flow

## Overview
Refactored the audition system to support a new 30-minute exam flow with per-question submission and Google Speech-to-Text integration.

## Key Changes

### 1. Backend Changes (`backend/server.js`)
- ✅ Installed `@google-cloud/speech` package
- ✅ Added Google Speech-to-Text client initialization
- ✅ Removed old bulk submission endpoint (`POST /api/submit-audition`)
- ✅ Created new per-question endpoint (`POST /api/audition/submit-answer`)
- ✅ Each answer is now:
  - Uploaded to Supabase Storage immediately
  - Transcribed using Google Speech-to-Text
  - Saved to `audition_answers` table

**New Endpoint:** `POST /api/audition/submit-answer`
- Accepts: `audio_file`, `userId`, `opportunityId`, `questionId`, `questionText`
- Returns: `answerId`, `audioUrl`, `transcript`, `questionId`

### 2. Frontend Components

#### A. AuditionQuestionScreen.tsx (Major Refactor)
**New Features:**
- **Two Timers:**
  - Master Clock: 30-minute exam timer (1800 seconds)
  - Per-Question Timer: Dynamic duration from question data
  
- **Auto-Advance:**
  - When per-question timer hits 0, automatically uploads and advances
  - When master clock hits 0, navigates to survey

- **New Function: `handleUploadAndAdvance()`:**
  1. Stops recording
  2. Creates FormData with audio + metadata
  3. Sends to `POST /api/audition/submit-answer`
  4. Shows "Transitioning..." screen for 5 seconds
  5. Advances to next question or survey

- **Updated Button:**
  - Text: "End Recording & Move to Next Question"
  - Calls: `handleUploadAndAdvance()`

- **Updated Props:**
  ```typescript
  interface AuditionQuestionScreenProps {
    questions: Question[];  // Now with id, text, duration
    opportunityId: string;
    userId: string;
    onComplete: () => void; // No longer passes answers array
  }
  ```

#### B. AuditionSurveyScreen.tsx (New Component)
- Star rating component (1-5 stars)
- Interactive hover effects
- Feedback messages based on rating
- Submits rating and shows completion message
- Auto-advances to completion screen after 2 seconds

#### C. Opportunities.tsx (Updated)
- Added survey flow state (`showSurvey`)
- Transformed backend questions to include duration (default: 120 seconds)
- New handlers:
  - `handleQuestionsComplete()`: Shows survey after all questions
  - `handleSurveyComplete()`: Shows completion screen
- Removed bulk submission logic (deprecated)

### 3. Data Structure Changes

**Question Interface:**
```typescript
interface Question {
  id: string;        // e.g., "q1", "q2", "q3"
  text: string;      // Question text
  duration: number;  // Time limit in seconds
}
```

**Default Duration:** 120 seconds (2 minutes) per question

### 4. Database Requirements

**New Table Needed:** `audition_answers`
```sql
CREATE TABLE audition_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  transcript TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_audition_answers_user_id ON audition_answers(user_id);
CREATE INDEX idx_audition_answers_opportunity_id ON audition_answers(opportunity_id);
```

### 5. Environment Setup

**Required Environment Variable:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
```

**Google Cloud Setup:**
1. Go to Google Cloud Console
2. Create a Service Account
3. Enable Speech-to-Text API
4. Download JSON key file
5. Save as `backend/google-credentials.json`

## User Flow

### Old Flow (Deprecated)
1. Start audition
2. Record all 3 answers
3. Submit all at once
4. Complete

### New Flow (Current)
1. Start audition → **Master Clock Starts (30 min)**
2. Question 1 → Record → Auto-upload → **5s Transition**
3. Question 2 → Record → Auto-upload → **5s Transition**
4. Question 3 → Record → Auto-upload → **5s Transition**
5. **Survey Screen** → Rate experience (1-5 stars)
6. **Completion Screen** → Return to dashboard

## Features

### Auto-Advance Triggers
- ✅ Per-question timer expires
- ✅ User clicks "End Recording & Move to Next Question"
- ✅ Master clock expires (navigates to survey)

### Timer Display
- Master Clock: Blue header bar, always visible
- Per-Question Timer: Large center display, turns red while recording

### Error Handling
- No audio recorded → Shows error toast
- Upload fails → Shows error toast, stays on same question
- Master clock expires → Force-advances to survey with warning

### Loading States
- "Uploading..." button state during submission
- "Transitioning..." full-screen overlay for 5 seconds
- "Submitting..." button state on survey

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Google credentials file is loaded correctly
- [ ] Opportunities load with transformed question structure
- [ ] Master clock starts on audition begin
- [ ] Per-question timer counts down correctly
- [ ] Recording starts/stops properly
- [ ] Auto-advance on timer expiry works
- [ ] Manual advance button works
- [ ] Audio uploads to backend successfully
- [ ] Transcription appears in response
- [ ] Survey screen appears after last question
- [ ] Star rating is interactive
- [ ] Completion screen shows after survey
- [ ] Can return to dashboard

## Next Steps

1. **Create Database Table:**
   - Run SQL in Supabase dashboard to create `audition_answers` table

2. **Set Up Google Cloud:**
   - Obtain service account JSON key
   - Place in `backend/google-credentials.json`
   - Add to `.env` file

3. **Test End-to-End:**
   - Start backend server
   - Complete full audition flow
   - Verify recordings in Supabase Storage
   - Check transcripts in database

4. **Optional Enhancements:**
   - Add question-specific durations in database
   - Implement survey submission endpoint
   - Add proctoring snapshot uploads per question
   - Display remaining time warnings at 30s, 10s

## Files Modified

1. ✅ `backend/server.js` - Complete refactor
2. ✅ `backend/package.json` - Added @google-cloud/speech
3. ✅ `backend/.env` - Added GOOGLE_APPLICATION_CREDENTIALS
4. ✅ `src/components/AuditionQuestionScreen.tsx` - Major refactor
5. ✅ `src/components/AuditionSurveyScreen.tsx` - New component
6. ✅ `src/pages/talent/Opportunities.tsx` - Updated flow

## API Endpoints

### GET /api/opportunities
- Returns: Array of opportunities
- Status: Unchanged

### POST /api/audition/submit-answer (NEW)
- Body: FormData with `audio_file`, `userId`, `opportunityId`, `questionId`, `questionText`
- Returns: `{ success, message, data: { answerId, audioUrl, transcript, questionId } }`

### POST /api/submit-audition (DEPRECATED)
- **Removed** - No longer used in new flow

## Configuration

**Backend Port:** 4000
**Master Clock Duration:** 1800 seconds (30 minutes)
**Default Question Duration:** 120 seconds (2 minutes)
**Transition Duration:** 5000 ms (5 seconds)
**Survey Auto-Advance:** 2000 ms (2 seconds)

---

**Date:** October 30, 2025
**Status:** ✅ Ready for Testing
**Dependencies:** @google-cloud/speech, Google Cloud credentials
