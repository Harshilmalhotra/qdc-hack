#!/bin/bash

# 🚀 CoreEyeTracker Deployment Script
# This script packages all necessary files for integration

echo "🎯 CoreEyeTracker - Packaging for Integration"
echo "============================================="

# Create deployment directory
DEPLOY_DIR="CoreEyeTracker-Package"
mkdir -p $DEPLOY_DIR

echo "📦 Creating package structure..."

# Core library files
mkdir -p $DEPLOY_DIR/src
cp src/CoreEyeTracker.js $DEPLOY_DIR/src/
echo "✅ Core library copied"

# Configuration files
cp package.json $DEPLOY_DIR/
cp .gitignore $DEPLOY_DIR/
echo "✅ Configuration files copied"

# Documentation
cp README.md $DEPLOY_DIR/
cp INTEGRATION_GUIDE.md $DEPLOY_DIR/
cp INTEGRATION_MANIFEST.md $DEPLOY_DIR/
echo "✅ Documentation copied"

# Demo files
cp demo-basic.html $DEPLOY_DIR/
cp test-30s-video.html $DEPLOY_DIR/
cp demo-video-dashboard.html $DEPLOY_DIR/
cp video-dashboard-integration.html $DEPLOY_DIR/
cp working-eye-tracker.html $DEPLOY_DIR/
echo "✅ Demo files copied"

# Create quick start file
cat > $DEPLOY_DIR/QUICK_START.md << 'EOF'
# 🚀 CoreEyeTracker Quick Start

## Installation

1. Copy `src/CoreEyeTracker.js` to your project
2. Add MediaPipe dependencies to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils@0.6.1629159505/control_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js" crossorigin="anonymous"></script>
<script src="path/to/CoreEyeTracker.js"></script>
```

## Basic Usage

```javascript
const tracker = new CoreEyeTracker({
    onGazeUpdate: (data) => {
        console.log('Gaze:', data.gaze.x, data.gaze.y);
        console.log('Zone:', data.zone);
    }
});

tracker.start();
```

## Demo Files

- `demo-basic.html` - Basic zone detection
- `test-30s-video.html` - Video player controls
- `demo-video-dashboard.html` - Advanced dashboard

See INTEGRATION_GUIDE.md for detailed instructions.
EOF

echo "✅ Quick start guide created"

# Create deployment info
cat > $DEPLOY_DIR/DEPLOYMENT_INFO.txt << EOF
CoreEyeTracker Deployment Package
================================

Created: $(date)
Version: 1.0.0

Files included:
- src/CoreEyeTracker.js (Core library)
- package.json (Dependencies)
- README.md (Main documentation)
- INTEGRATION_GUIDE.md (Integration steps)
- INTEGRATION_MANIFEST.md (Package contents)
- QUICK_START.md (Quick setup guide)
- Demo files (5 HTML examples)

Total files: $(find $DEPLOY_DIR -type f | wc -l)
Package size: $(du -sh $DEPLOY_DIR | cut -f1)

Ready for integration into your main project!
EOF

echo "✅ Deployment info created"

# Create archive
echo "📋 Creating archive..."
tar -czf ${DEPLOY_DIR}.tar.gz $DEPLOY_DIR/
zip -r ${DEPLOY_DIR}.zip $DEPLOY_DIR/ > /dev/null 2>&1

echo ""
echo "🎉 Package created successfully!"
echo "📁 Directory: $DEPLOY_DIR/"
echo "📦 Archive: ${DEPLOY_DIR}.tar.gz"
echo "📦 Archive: ${DEPLOY_DIR}.zip"
echo ""
echo "🚀 Ready to deploy to your main project!"