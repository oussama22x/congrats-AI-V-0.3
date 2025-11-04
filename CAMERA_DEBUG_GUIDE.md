# Camera Black Screen Debug Guide

## Issue
After clicking "Start Audition", the camera turns off and the small window shows black.

## Fix Applied
Changed `auditionStarted` from state to ref to prevent cleanup on unmount.

## How to Test & Debug

### 1. Open Browser Console (F12)

### 2. Start Audition and Watch for These Logs:

**Step 1: Camera Setup**
```
🎥 Requesting camera access...
✅ Camera access granted: Array(1)
📺 Attaching stream to video element...
✅ Video playing
✅ Camera ready state set to true
```

**Step 2: Click "Start Audition" Button**
```
🎥 Keeping camera stream active for audition
Stream reference: MediaStream {...}
Active tracks: Array(1) [VideoTrack {...}]
```

**Step 3: Modal Closes / Component Unmounts**
```
🎥 Camera stream kept active for audition (cleanup skipped)
```
👆 **IMPORTANT**: Should say "cleanup skipped", NOT "Stopped track"

**Step 4: AuditionQuestionScreen Renders**
```
🎬 Beginning audition with camera stream: MediaStream
```

**Step 5: BackgroundCamera Component**
```
🎥 BackgroundCamera: Attaching stream to video element
Stream tracks: Array(1) [VideoTrack {...}]
Stream active: true
✅ BackgroundCamera: Video playing successfully
```

### 3. What to Look For

#### ✅ GOOD - Camera Should Work:
```
Stream active: true
Stream tracks: Array(1) [VideoTrack { enabled: true, muted: false, ... }]
✅ BackgroundCamera: Video playing successfully
```

#### ❌ BAD - Camera Will Be Black:
```
Stream active: false
Stream tracks: Array(0) []
OR
Stream tracks: Array(1) [VideoTrack { enabled: false, ... }]
OR
🛑 Stopped track: <track label>
```

### 4. Check Camera Track Status

Run this in the console after clicking Start Audition:
```javascript
// Check if stream is still active
console.log("Stream active:", stream.active);
console.log("Tracks:", stream.getTracks().map(t => ({ 
  kind: t.kind, 
  enabled: t.enabled, 
  readyState: t.readyState 
})));
```

**Expected Output:**
```javascript
Stream active: true
Tracks: [{kind: "video", enabled: true, readyState: "live"}]
```

### 5. Common Issues & Solutions

#### Issue 1: "🛑 Stopped track" appears
**Problem**: Cleanup function is stopping the camera
**Solution**: The ref fix should prevent this

#### Issue 2: Stream is null in BackgroundCamera
**Problem**: Stream not passed correctly through props
**Check**:
```javascript
// In Opportunities.tsx
console.log("Camera stream ref:", cameraStreamRef.current);

// In AuditionQuestionScreen.tsx
console.log("Received camera stream:", cameraStream);
```

#### Issue 3: Stream exists but tracks are stopped
**Problem**: Tracks were stopped somewhere
**Check**: Search logs for "🛑 Stopped track"

#### Issue 4: Video element not playing
**Problem**: Autoplay blocked or stream attachment failed
**Check**: Look for "❌ BackgroundCamera: Error playing video"

### 6. Manual Test in Console

After camera is set up, try this:
```javascript
// Get the video element
const video = document.querySelector('video');

// Check if stream is attached
console.log("Video srcObject:", video.srcObject);
console.log("Video paused:", video.paused);
console.log("Video readyState:", video.readyState);

// Try to play manually
video.play().then(() => {
  console.log("✅ Video playing");
}).catch(e => {
  console.error("❌ Play failed:", e);
});
```

### 7. Expected Complete Log Flow

```
🎥 Requesting camera access...
✅ Camera access granted: Array(1)
📺 Attaching stream to video element...
✅ Video metadata loaded
✅ Video playing
✅ Camera ready state set to true
[User clicks Start Audition]
🎥 Keeping camera stream active for audition
Stream reference: MediaStream {active: true, id: "..."}
Active tracks: [VideoTrack {kind: "video", enabled: true, readyState: "live"}]
🎥 Camera stream kept active for audition (cleanup skipped)
🎬 Beginning audition with camera stream: MediaStream
🎥 BackgroundCamera: Attaching stream to video element
Stream tracks: [VideoTrack {kind: "video", enabled: true, readyState: "live"}]
Stream active: true
✅ BackgroundCamera: Video playing successfully
```

### 8. If Still Black Screen

Try refreshing and check:
1. Does camera work in System Check modal? ✅
2. Does "cleanup skipped" appear in logs? ✅
3. Is stream.active = true? ✅
4. Are tracks.readyState = "live"? ✅
5. Does BackgroundCamera receive the stream? ✅

If all ✅ but still black, check:
- Browser console for errors
- Video element CSS (opacity, display, etc.)
- Z-index conflicts
- Stream compatibility

## Quick Fix Test

After the fix, you should see:
1. ✅ Camera preview works in modal
2. ✅ Click "Start Audition"
3. ✅ Console shows "cleanup skipped"
4. ✅ Small camera appears in corner (NOT BLACK)
5. ✅ Camera stays on during all questions

Try it now and share the console logs if still having issues! 🎥
