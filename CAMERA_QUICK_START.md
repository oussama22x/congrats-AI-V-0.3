# Camera Background Feature - Quick Start Guide

## 🎥 What Does It Do?

The camera stays ON during the entire audition and shows a live feed in the corner of the screen - but **DOES NOT record or store anything**. It's just for visual proctoring.

## 🚀 How to Test

### Step 1: Start an Audition
```
1. Go to Opportunities page
2. Click "Start Audition" on any card
```

### Step 2: Camera Check
```
1. Click "Next: System Check"
2. Browser asks for camera permission → Click "Allow"
3. See your face in the preview box
4. Click "Start Audition"
```

### Step 3: During Audition
```
1. Camera appears in TOP-RIGHT corner
2. Shows "LIVE" indicator with red dot
3. Small preview (not intrusive)
4. Answer questions as normal
```

### Step 4: Camera Stays Active
```
✅ Camera visible on Question 1
✅ Camera visible on Question 2
✅ Camera visible on Question 3
... stays on for ALL questions
```

### Step 5: Automatic Cleanup
```
When you complete the audition:
✅ Camera automatically stops
✅ Stream cleaned up
✅ Camera LED light turns off
```

## 🎯 What You Should See

### Camera Preview (Small, Top-Right Corner)
```
┌─────────────────────────────────────┐
│  ┌──────────┐                       │
│  │ 🔴 LIVE  │                       │
│  │          │                       │
│  │  [Your   │    Question Screen    │
│  │   Face]  │                       │
│  │          │                       │
│  └──────────┘                       │
│                                     │
│     [ Question Text Here ]          │
│     [ Record Answer Button ]        │
└─────────────────────────────────────┘
```

## 🔍 Console Logs to Watch

Open browser console (F12) and look for:

### ✅ Good Signs:
```
🎥 Requesting camera access...
✅ Camera access granted
📺 Attaching stream to video element...
✅ Video playing
🎥 Keeping camera stream active for audition
🎬 Beginning audition with camera stream
🎥 BackgroundCamera: Attaching stream to video element
```

### ✅ On Completion:
```
🧹 Cleaning up camera stream (audition complete)
🛑 Stopped camera track: <track name>
```

### ❌ If Something Goes Wrong:
```
❌ Camera access error: [error message]
⚠️ BackgroundCamera: No stream or video element
```

## ⚙️ Camera Settings

Currently configured as:
- **Position**: Top-right corner
- **Size**: Small (128x96 pixels)
- **Indicator**: Red "LIVE" badge
- **Recording**: NONE (not recorded!)

### Want to Change Settings?

Edit in `src/components/AuditionQuestionScreen.tsx`:

```typescript
<BackgroundCamera 
  stream={cameraStream} 
  position="top-right"    // Change to: "top-left", "bottom-left", "bottom-right"
  size="sm"               // Change to: "md" or "lg"
  showIndicator={true}    // Change to: false (hide LIVE badge)
/>
```

## 🐛 Troubleshooting

### Camera Not Showing During Audition?

**Check Console Logs:**
1. Did you see "🎥 Keeping camera stream active"?
2. Did you see "🎬 Beginning audition with camera stream"?
3. Any error messages?

**Common Issues:**
- ❌ Permission denied → Reload page, allow camera
- ❌ No camera found → Check hardware, close other apps
- ❌ Stream is null → Check if camera worked in system check

### Camera Still Running After Audition?

**Check Console Logs:**
- Should see "🧹 Cleaning up camera stream"
- Should see "🛑 Stopped camera track"

**Manual Check:**
- Camera LED light should turn OFF
- If still on, refresh the page

### Camera Disappeared During Questions?

**This shouldn't happen!** If it does:
1. Check console for errors
2. Check if `cameraStreamRef.current` is null
3. Verify stream was passed correctly

## 📝 Important Notes

### What the Camera DOES:
✅ Shows live preview in corner
✅ Stays on during entire audition
✅ Automatically cleaned up when done
✅ Professional appearance

### What the Camera DOES NOT Do:
❌ Does NOT record video
❌ Does NOT capture screenshots
❌ Does NOT store any data
❌ Does NOT send video to server
❌ Does NOT use audio

## 🔒 Privacy

**Current Implementation:**
- Camera stream is LOCAL ONLY
- No video recording
- No data storage
- No server transmission
- Stream destroyed after audition

This is a **visual-only proctoring feature** - the camera just needs to be visible to show the candidate is being monitored, but nothing is actually recorded.

## 🎨 Customization Ideas

Want to change the appearance? Edit `src/components/BackgroundCamera.tsx`:

### Change Size:
```typescript
const sizeClasses = {
  sm: "w-32 h-24",     // Current (small)
  md: "w-48 h-36",     // Medium
  lg: "w-64 h-48",     // Large
};
```

### Change Position:
```typescript
const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",      // Current
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};
```

### Change Border/Style:
```typescript
className="border-2 border-primary/30 shadow-2xl"
// Try: border-4 border-red-500 shadow-xl
```

## ✅ Success Criteria

The feature is working correctly if:
1. ✅ Camera appears in system check modal
2. ✅ Camera permission is granted
3. ✅ Camera shows in top-right during questions
4. ✅ "LIVE" indicator is visible
5. ✅ Camera stays visible through ALL questions
6. ✅ Camera stops when audition completes
7. ✅ No console errors
8. ✅ Camera LED turns off after completion

## 🚀 Ready to Test!

Go ahead and test it now:
1. Navigate to Opportunities
2. Start an audition
3. Watch for the camera in the corner
4. Complete the audition
5. Verify cleanup

The camera background feature is fully implemented and ready! 🎥✨
