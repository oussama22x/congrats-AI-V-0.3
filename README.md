# Congrats AI - Talent Audition Platform

A modern React-based audition platform for talent vetting with audio recording, camera proctoring, and real-time submission tracking.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:8080` (or the next available port).

---

## ✨ Features Added (Latest Updates)

### 1. **Opportunities Listing Page** (`/opportunities`)
- Grid-based card layout displaying available auditions
- Rich opportunity cards with:
  - Job title, company, location, and employment type
  - Hourly rate ranges
  - Required skills as badges
  - "Start Audition" CTA button

### 2. **Two-Step Audition Modal**
**Step 1: Rules & Guidelines**
- Displays audition rules and requirements
- Interactive checklist for user confirmation
- Professional UI with animations

**Step 2: System Check (Camera Proctoring)**
- Real-time camera access verification using `MediaDevices API`
- Live video preview with mirrored display
- Error handling for systems without cameras (testing fallback)
- "Continue Anyway" option for development/testing

### 3. **Audio Recording Question Flow**
- Sequential question presentation with progress tracking
- **Audio Recording Features:**
  - Start/Stop recording with `MediaRecorder API`
  - 2-minute countdown timer per question
  - Three-state UI: Idle → Recording → Recorded
  - Playback functionality to review answer before submitting
  - Visual recording indicators (pulse animation)
- Question navigation with "Next Question" flow
- Automatic collection of all audio responses

### 4. **Answer Collection & Review System**
- All audio answers stored as `Blob[]` array
- Passed through component tree to completion screen
- **Review Section** on completion screen:
  - Displays all questions with indices
  - "Play My Answer" button for each question
  - Audio playback using Web Audio API
  - Automatic URL cleanup after playback

### 5. **Submission Tracking**
- Mock global state store (`mockSubmissionStore.js`)
- Submissions saved with metadata:
  - Job title, company, location, type, rate
  - Submission timestamp
  - Status tracking ("Under Review")
- Integrated with dashboard

### 6. **Tabbed Dashboard Interface**
- **My Vetting Tab**: Original dashboard content
- **My Applications Tab**: 
  - Lists all submitted auditions
  - Badge counter showing total submissions
  - Empty state with "Browse Opportunities" CTA
  - Submission cards with full details

---

## 🏗️ Architecture Overview (For Backend Team)

### Frontend State Flow
```
OpportunitiesPage (Parent)
    ├── OpportunityCard[] (Grid Display)
    ├── AuditionStartModal (2-Step Modal)
    │   ├── Step 1: Rules + Checklist
    │   └── Step 2: SystemCheckStep (Camera Verification)
    ├── AuditionQuestionScreen (Recording Interface)
    │   ├── useAudioRecorder (MediaRecorder Hook)
    │   ├── useCountdownTimer (2-min Timer Hook)
    │   └── Answer Collection: Blob[]
    └── AuditionCompleteScreen (Review + Playback)
```

### Key Data Structures

#### Opportunity Object
```typescript
{
  id: number;
  title: string;           // "Backend Engineer"
  company: string;         // "Vetted AI"
  location: string;        // "Remote (Global)"
  type: string;            // "Full-time" | "Contract"
  rate: string;            // "$80 - $100 /hr"
  skills: string[];        // ["Node.js", "TypeScript"]
  questions: string[];     // Array of audition questions
}
```

#### Submission Object (Current Mock)
```javascript
{
  id: string;              // UUID
  title: string;
  company: string;
  location: string;
  type: string;
  rate: string;
  status: string;          // "Under Review"
  submittedAt: Date;
}
```

#### Final Submission Data (Collected)
```typescript
{
  questions: string[];     // All questions asked
  answers: Blob[];         // Audio recordings (1:1 match with questions)
}
```

---

## 🔌 Backend Integration Points

### 1. **Opportunities Endpoint**
```
GET /api/opportunities
Response: Opportunity[]
```
Replace `DUMMY_OPPORTUNITIES` in `src/pages/talent/Opportunities.tsx`

### 2. **Submit Audition Endpoint**
```
POST /api/auditions/submit
Content-Type: multipart/form-data

Body:
{
  opportunityId: string;
  userId: string;
  questions: string[];           // Array of question texts
  answers: File[];               // Audio blobs (webm/ogg format)
  metadata: {
    submittedAt: ISO8601;
    userAgent: string;
    recordingDurations: number[];
  }
}

Response:
{
  submissionId: string;
  status: "submitted" | "processing";
}
```

**Frontend Implementation:**
- Audio blobs are collected in `AuditionQuestionScreen.tsx`
- Currently passed to `handleCompleteAudition(answers: Blob[])`
- Need to convert `Blob[]` to `FormData` and POST to backend

### 3. **Get User Submissions Endpoint**
```
GET /api/auditions/submissions?userId={userId}

Response:
{
  submissions: [
    {
      id: string;
      opportunityId: string;
      title: string;
      company: string;
      status: "under_review" | "approved" | "rejected";
      submittedAt: ISO8601;
      reviewedAt?: ISO8601;
      feedback?: string;
    }
  ]
}
```

Replace `mockSubmissionStore.js` with real API call in `src/pages/talent/TalentDashboard.tsx`

### 4. **Camera/System Check Logging (Optional)**
```
POST /api/auditions/system-check
Body:
{
  userId: string;
  opportunityId: string;
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  browserInfo: string;
}
```

For audit trail and fraud detection.

---

## 📁 Key Files

| File Path | Purpose |
|-----------|---------|
| `src/pages/talent/Opportunities.tsx` | Main opportunities page + audition orchestration |
| `src/components/OpportunityCard.tsx` | Rich opportunity card component |
| `src/components/AuditionStartModal.tsx` | 2-step modal (rules + camera check) |
| `src/components/SystemCheckStep.tsx` | Camera proctoring verification |
| `src/components/AuditionQuestionScreen.tsx` | Question flow + audio recording |
| `src/components/AuditionCompleteScreen.tsx` | Completion screen + review playback |
| `src/hooks/useAudioRecorder.ts` | Audio recording logic with MediaRecorder |
| `src/hooks/useCountdownTimer.ts` | 2-minute countdown timer |
| `src/lib/mockSubmissionStore.js` | Mock global state (replace with API) |
| `src/pages/talent/TalentDashboard.tsx` | Tabbed dashboard with submissions |

---

## 🛠️ Tech Stack

- **React 18.3.1** with TypeScript
- **Vite** - Build tool
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Router** - Navigation
- **Browser APIs:**
  - `MediaRecorder` - Audio recording
  - `MediaDevices.getUserMedia()` - Camera/microphone access
  - `Web Audio API` - Playback

---

## 🔒 Security Considerations (For Backend)

1. **Audio File Validation:**
   - Verify MIME types (webm, ogg, mp4)
   - Limit file sizes (e.g., max 10MB per answer)
   - Scan for malicious content

2. **Proctoring Data:**
   - Store camera check results
   - Log recording timestamps
   - Track IP addresses for fraud detection

3. **Rate Limiting:**
   - Prevent multiple submissions per opportunity
   - Throttle audition starts per user

4. **Authentication:**
   - Verify user is logged in before showing opportunities
   - Validate opportunityId exists before accepting submissions

---

## 🧪 Testing

Currently using mock data for testing. To test the full flow:

1. Navigate to `/opportunities`
2. Click "Start Audition" on any card
3. Accept rules and pass camera check
4. Record answers for each question (allows testing without actual recording)
5. Review answers on completion screen
6. Check "My Applications" tab in dashboard

---

## 📝 Notes for Backend Developer

- **Audio Format:** Frontend uses browser's native MediaRecorder, which typically outputs `audio/webm` or `audio/ogg`. Ensure backend supports these formats or convert server-side.
- **Question-Answer Matching:** The `answers[]` array is in the exact same order as `questions[]`. Use index to match.
- **Blob Handling:** Frontend stores raw Blob objects. Convert to File objects with meaningful names before uploading.
- **Mock Store:** The file `src/lib/mockSubmissionStore.js` is a temporary in-memory store. Replace with real API calls.
- **Status Updates:** Implement WebSocket or polling for real-time submission status updates.

---

## 🎯 Next Steps

1. **Backend Integration:**
   - Implement endpoints listed above
   - Replace mock data with API calls
   - Add authentication middleware

2. **Enhanced Features:**
   - Video recording option
   - Multiple file uploads (resume, portfolio)
   - Real-time status notifications
   - Admin review dashboard

3. **Production Readiness:**
   - Add error boundaries
   - Implement retry logic for failed uploads
   - Add analytics tracking
   - Optimize audio compression

---

**Built with ❤️ by the Congrats AI Team**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/79ade59d-d19d-43ad-80e7-428e8bf3d9cc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
