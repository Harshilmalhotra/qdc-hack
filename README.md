# 🎯 Accessibility Eye Tracker - Production Ready

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Mesh-blue.svg)](https://mediapipe.dev/)
[![Browser Support](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Edge-green.svg)](https://caniuse.com/webrtc)

A production-ready eye tracking module for EdTech video dashboards using **MediaPipe FaceMesh + WebRTC** for precise iris tracking and gaze detection. Built for accessibility-first learning platforms.

## ✨ Features

- 🎯 **High-Precision Iris Tracking** - MediaPipe FaceMesh with 478 facial landmarks
- 📹 **Video Dashboard Integration** - Ready for learning platforms and video players
- 🔧 **Plug-and-Play** - Easy integration with existing web applications
- 📊 **Real-time Analytics** - Gaze zones, attention metrics, engagement tracking
- ♿ **Accessibility First** - WCAG compliant with keyboard fallbacks
- 🚀 **Performance Optimized** - <10% CPU usage with temporal smoothing
- 🌐 **Cross-Browser** - Chrome, Firefox, Edge, Safari support
- 📱 **Responsive** - Works on desktop and tablet devices

## 🚀 Quick Start

### 1. Include MediaPipe Scripts

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6.1629159505/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js"></script>
```

### 2. Initialize Eye Tracker

```javascript
import CoreEyeTracker from './src/CoreEyeTracker.js';

// Create video element for camera feed
const videoElement = document.getElementById('eyeTrackerVideo');

// Initialize with callbacks
const eyeTracker = new CoreEyeTracker({
    sensitivity: { x: 3.5, y: 2.5 },
    smoothing: 3,
    onGazeUpdate: (data) => {
        console.log('Gaze:', data.gaze);
        console.log('Zone:', data.zone);
    },
    onZoneChange: (data) => {
        console.log('Zone changed to:', data.zone);
        handleZoneAction(data.zone);
    }
});

// Start tracking
await eyeTracker.initialize(videoElement);
await eyeTracker.start();
```

### 3. Handle Gaze Events

```javascript
function handleZoneAction(zone) {
    switch(zone) {
        case 'LEFT':
            // Navigate to previous content
            break;
        case 'RIGHT':
            // Navigate to next content
            break;
        case 'CENTER':
            // Select/play current content
            break;
        case 'DOWN':
            // Show dashboard/controls
            break;
    }
}
```

## 📖 API Reference

### Constructor Options

```javascript
const eyeTracker = new CoreEyeTracker({
    sensitivity: { x: 3.5, y: 2.5 },    // Gaze amplification
    smoothing: 3,                        // Temporal smoothing (frames)
    minDetectionConfidence: 0.7,         // Face detection threshold
    minTrackingConfidence: 0.7,          // Face tracking threshold
    debugMode: false,                    // Enable debug logging
    
    // Callbacks
    onGazeUpdate: (data) => {},          // Called on every gaze update
    onZoneChange: (data) => {},          // Called when zone changes
    onFaceDetected: (detected) => {},    // Called when face detection changes
    onError: (type, error) => {}         // Called on errors
});
```

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `initialize(videoElement)` | Initialize tracker with video element | `Promise<boolean>` |
| `start()` | Start eye tracking | `Promise<boolean>` |
| `stop()` | Stop eye tracking | `void` |
| `getCurrentGaze()` | Get current gaze data | `Object` |
| `getAnalytics()` | Get tracking analytics | `Object` |
| `setZoneDetector(fn)` | Custom zone detection function | `void` |

### Events Data Structure

#### onGazeUpdate
```javascript
{
    gaze: { x: 0.5, y: 0.3, confidence: 0.95 },
    zone: 'CENTER',
    raw: { x: 0.52, y: 0.31, confidence: 0.95 },
    timestamp: 1640995200000
}
```

#### onZoneChange
```javascript
{
    zone: 'RIGHT',
    previousZone: 'CENTER',
    gaze: { x: 0.8, y: 0.5, confidence: 0.92 },
    timestamp: 1640995200000
}
```

## 🎮 Demo Examples

### 1. Basic Eye Tracking Demo
```bash
python -m http.server 8080
# Open: http://localhost:8080/demo-basic.html
```

### 2. Video Dashboard Integration
```bash
python -m http.server 8080
# Open: http://localhost:8080/demo-video-dashboard.html
```

### 3. Working Eye Tracker (Reference)
```bash
python -m http.server 8080
# Open: http://localhost:8080/working-eye-tracker.html
```

## 🎯 Zone Detection

Default zones (can be customized):

```
┌─────────────────────────────┐
│  LEFT    │  CENTER  │ RIGHT │
│          │          │       │
│          │    👁️    │       │
│          │          │       │
├──────────┼──────────┼───────┤
│         DOWN         │       │
└─────────────────────────────┘
```

### Custom Zone Detection

```javascript
eyeTracker.setZoneDetector((gazePoint) => {
    const { x, y } = gazePoint;
    
    // Custom video player zones
    if (x >= 0.1 && x <= 0.4 && y >= 0.1 && y <= 0.3) return 'PLAY_PAUSE';
    if (x >= 0.1 && x <= 0.7 && y >= 0.9 && y <= 1.0) return 'TIMELINE';
    if (x >= 0.85 && x <= 1.0 && y >= 0.1 && y <= 0.25) return 'VOLUME';
    if (x >= 0.2 && x <= 0.8 && y >= 0.35 && y <= 0.85) return 'CONTENT';
    
    return 'OUTSIDE';
});
```

## 🏗️ Integration Examples

### React Component

```jsx
import { useEffect, useRef, useState } from 'react';
import CoreEyeTracker from './CoreEyeTracker.js';

function EyeTrackingVideoPlayer() {
    const videoRef = useRef(null);
    const [eyeTracker, setEyeTracker] = useState(null);
    const [currentZone, setCurrentZone] = useState('NONE');
    
    useEffect(() => {
        const tracker = new CoreEyeTracker({
            onZoneChange: (data) => {
                setCurrentZone(data.zone);
                handleVideoControl(data.zone);
            }
        });
        
        tracker.initialize(videoRef.current).then(() => {
            tracker.start();
            setEyeTracker(tracker);
        });
        
        return () => tracker?.stop();
    }, []);
    
    function handleVideoControl(zone) {
        if (zone === 'PLAY_PAUSE') {
            // Toggle video playback
        }
    }
    
    return (
        <div>
            <video ref={videoRef} style={{ display: 'none' }} />
            <div>Current Zone: {currentZone}</div>
        </div>
    );
}
```

### Vue.js Component

```vue
<template>
    <div>
        <video ref="eyeVideo" style="display: none"></video>
        <div class="zone-display">{{ currentZone }}</div>
    </div>
</template>

<script>
import CoreEyeTracker from './CoreEyeTracker.js';

export default {
    data() {
        return {
            eyeTracker: null,
            currentZone: 'NONE'
        }
    },
    async mounted() {
        this.eyeTracker = new CoreEyeTracker({
            onZoneChange: (data) => {
                this.currentZone = data.zone;
            }
        });
        
        await this.eyeTracker.initialize(this.$refs.eyeVideo);
        await this.eyeTracker.start();
    },
    beforeUnmount() {
        this.eyeTracker?.stop();
    }
}
</script>
```

## 🔧 Configuration

### Sensitivity Tuning

```javascript
// High sensitivity (small eye movements)
{ sensitivity: { x: 4.0, y: 3.0 } }

// Low sensitivity (larger eye movements required)
{ sensitivity: { x: 2.0, y: 1.5 } }

// Balanced (recommended)
{ sensitivity: { x: 3.5, y: 2.5 } }
```

### Smoothing Options

```javascript
// No smoothing (jittery but responsive)
{ smoothing: 1 }

// Light smoothing (good balance)
{ smoothing: 3 }

// Heavy smoothing (stable but slower)
{ smoothing: 5 }
```

## 🎯 Performance Optimization

- **Frame Rate**: Automatically throttled to 30 FPS
- **CPU Usage**: Typically <10% on modern devices
- **Memory**: Bounded gaze history prevents memory leaks
- **Network**: CDN-hosted MediaPipe for fast loading

## 🛠️ Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   ```javascript
   eyeTracker.onError = (type, error) => {
       if (type === 'START_ERROR' && error.name === 'NotAllowedError') {
           alert('Camera permission required for eye tracking');
       }
   };
   ```

2. **MediaPipe Loading Failed**
   ```javascript
   // Ensure scripts are loaded before initializing
   await new Promise(resolve => setTimeout(resolve, 1000));
   await eyeTracker.initialize(videoElement);
   ```

3. **Poor Tracking Accuracy**
   - Ensure good lighting conditions
   - Position face 50-80cm from camera
   - Adjust sensitivity settings
   - Check for stable internet connection

## 📊 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✅ Full |
| Firefox | 78+ | ✅ Full |
| Edge | 80+ | ✅ Full |
| Safari | 14+ | ⚠️ Limited |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: support@example.com
- 💬 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Full Documentation](https://your-docs-site.com)

---

Made with ❤️ for accessible EdTech platforms