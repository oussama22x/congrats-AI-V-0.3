# Camera Troubleshooting Guide

## What Was Fixed

I've updated the `SystemCheckStep.tsx` component to fix several potential camera issues:

### Changes Made:

1. **Improved Camera Initialization**
   - Added explicit `load()` and `play()` calls to ensure video starts
   - Added `facingMode: "user"` to specifically request the front-facing camera
   - Better error handling with detailed console logging

2. **Added Retry Functionality**
   - New "Retry Camera Access" button appears when camera fails
   - Proper cleanup of existing streams before retrying
   - Visual feedback during retry attempts

3. **Enhanced Error Detection**
   - More detailed error logging in console
   - Better error messages for different failure scenarios
   - Video element event handlers to track playback status

4. **Fixed Race Conditions**
   - Removed early return that could prevent camera setup
   - Added small delay to ensure video element is ready
   - Proper cleanup on component unmount

## How to Test

1. **Open the Application**
   - Navigate to the audition start modal
   - Click "Next: System Check"

2. **Check Browser Console**
   - Open Developer Tools (F12 or Cmd+Option+I)
   - Go to Console tab
   - Look for camera-related messages:
     - 🎥 "Requesting camera access..."
     - ✅ "Camera access granted"
     - 📺 "Attaching stream to video element..."
     - ✅ "Video playing"

3. **If Camera Doesn't Work**
   - Check console for error messages
   - Click the "Retry Camera Access" button
   - Check browser permissions (see below)

## Common Issues & Solutions

### Issue 1: "Camera permission denied"
**Solution:**
1. Click the 🔒 or ⓘ icon in the address bar
2. Find "Camera" permissions
3. Change to "Allow"
4. Click "Retry Camera Access" button
5. Or reload the page

### Issue 2: "No camera device found"
**Solution:**
- Check if your camera is connected (for external cameras)
- Check if another application is using the camera
- Close other apps that might be using the camera (Zoom, Skype, etc.)
- Try a different browser

### Issue 3: Camera shows black screen
**Solution:**
- Check console for errors
- Try clicking "Retry Camera Access"
- Check if camera LED light is on (indicates camera is active)
- Try restarting the browser

### Issue 4: Browser doesn't support camera
**Solution:**
- Use Chrome, Firefox, or Edge (latest versions)
- Safari on iOS/macOS should also work
- Ensure you're using HTTPS (not HTTP) - cameras require secure context

### Issue 5: Permission popup doesn't appear
**Solution:**
1. The browser might have blocked the popup
2. Look for a blocked notification icon in address bar
3. Click it and allow camera access
4. Or go to browser settings and manually allow camera for your site

## Browser-Specific Instructions

### Chrome/Edge
1. Go to `chrome://settings/content/camera`
2. Ensure camera is not blocked
3. Add your site to "Allowed to use your camera" list

### Firefox
1. Go to `about:preferences#privacy`
2. Scroll to "Permissions" → "Camera"
3. Click "Settings" and ensure your site is allowed

### Safari
1. Go to Safari → Settings → Websites → Camera
2. Find your site and change to "Allow"

## Console Commands for Debugging

Open browser console and run these to test camera directly:

```javascript
// Test if camera API is available
console.log("Camera API available:", !!navigator.mediaDevices?.getUserMedia);

// List all video devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log("Available cameras:", cameras);
  });

// Test camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("✅ Camera works!", stream.getVideoTracks());
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error("❌ Camera error:", error.name, error.message);
  });
```

## What to Check in Console

Look for these log messages in order:

1. ✅ `"🎥 Requesting camera access..."`
2. ✅ `"✅ Camera access granted"` with track info
3. ✅ `"Video track settings"` with camera resolution
4. ✅ `"📺 Attaching stream to video element..."`
5. ✅ `"✅ Video loaded"`
6. ✅ `"✅ Video playing"`
7. ✅ `"✅ Camera ready state set to true"`

If you see an error at any step, that's where the issue is.

## Video Element Events to Monitor

The video element will log these events:
- `"✅ Video metadata loaded"` - Video info received
- `"✅ Video data loaded"` - Video content loaded
- `"✅ Video can play"` - Ready to play
- `"✅ Video started playing"` - Actually playing
- `"⚠️ Video paused"` - Video stopped (shouldn't happen)
- `"❌ Video element error"` - Something went wrong

## Still Not Working?

If camera still doesn't work after trying all above:

1. **Share Console Output**
   - Copy all console messages
   - Share with developer for debugging

2. **Try Basic HTML Test**
   - Create a simple HTML file:
   ```html
   <!DOCTYPE html>
   <html>
   <body>
     <video id="video" autoplay playsinline style="width: 100%"></video>
     <script>
       navigator.mediaDevices.getUserMedia({ video: true })
         .then(stream => {
           document.getElementById('video').srcObject = stream;
         })
         .catch(e => alert('Error: ' + e.message));
     </script>
   </body>
   </html>
   ```
   - If this doesn't work, it's a browser/system issue, not the app

3. **System-Level Checks**
   - macOS: System Settings → Privacy & Security → Camera
   - Windows: Settings → Privacy → Camera
   - Linux: Check camera with `cheese` or `vlc` command
   - Ensure camera drivers are installed

## Testing Mode

The app allows you to continue without camera in testing mode. This is indicated by:
- Yellow warning message
- "Continue Anyway (Testing)" button
- "⚠️ Camera verification skipped" message

This is only for development. Production requires working camera.
