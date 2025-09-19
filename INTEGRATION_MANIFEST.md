# 🎯 CoreEyeTracker Integration Manifest

## 📦 Complete Package for Integration

This manifest lists all files required to integrate CoreEyeTracker into your main project.

### 🔧 Core Library Files

| File | Purpose | Required |
|------|---------|----------|
| `src/CoreEyeTracker.js` | Main eye tracking library | ✅ **ESSENTIAL** |
| `package.json` | Dependencies and project config | ✅ **ESSENTIAL** |

### 📋 Dependencies Required

#### MediaPipe CDN Links (Required)
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6.1629159505/control_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js" crossorigin="anonymous"></script>
```

### 🚀 Demo & Example Files

| File | Purpose | Use Case |
|------|---------|----------|
| `demo-basic.html` | Basic zones demo | Simple gaze-based UI controls |
| `test-30s-video.html` | Video controls demo | Video player with eye tracking |
| `demo-video-dashboard.html` | Advanced video dashboard | Complex video interface |
| `video-dashboard-integration.html` | Integration example | Full-featured implementation |
| `working-eye-tracker.html` | Debug/test version | Development testing |

### 📖 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `INTEGRATION_GUIDE.md` | Step-by-step integration guide |
| `INTEGRATION_MANIFEST.md` | This file - package contents |

### 🛠 Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Git ignore patterns |
| `package.json` | Project dependencies |

## 🎯 Quick Integration Steps

### 1. Copy Core Files
```bash
# Copy these essential files to your project:
src/CoreEyeTracker.js
package.json
```

### 2. Add Dependencies
```html
<!-- Add MediaPipe scripts to your HTML head -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6.1629159505/control_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js" crossorigin="anonymous"></script>

<!-- Add CoreEyeTracker -->
<script src="path/to/CoreEyeTracker.js"></script>
```

### 3. Initialize Tracker
```javascript
const tracker = new CoreEyeTracker({
    onGazeUpdate: (data) => {
        console.log('Gaze:', data.gaze);
        console.log('Zone:', data.zone);
    },
    onFaceDetected: () => console.log('Face detected'),
    onFaceLost: () => console.log('Face lost')
});

// Start tracking
tracker.start();
```

## 📋 File Sizes & Info

- **CoreEyeTracker.js**: ~15KB (core library)
- **Total package**: ~200KB (with all demos)
- **Required external dependencies**: MediaPipe CDN (~2MB)

## 🔄 Version Info

- **Version**: 1.0.0
- **Last Updated**: September 19, 2025
- **MediaPipe Version**: 0.4.1633559619 (Face Mesh)
- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+

## 📞 Support

- See `INTEGRATION_GUIDE.md` for detailed integration steps
- Check demo files for implementation examples
- All demos are self-contained and ready to run