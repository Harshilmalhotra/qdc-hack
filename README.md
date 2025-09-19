# Adaptive Hands-Free Learning Platform

A comprehensive React 18 + TypeScript + Tailwind PWA designed for users with physical disabilities, featuring eye-tracking, voice commands, and full accessibility compliance.

## 🌟 Features

### 🧩 Core Components

- **Eye-Tracking Engine**: MediaPipe FaceMesh integration with gaze zone detection
- **Voice Interface**: Whisper AI for low-latency speech recognition + Web Speech API fallback
- **Interaction Manager**: Unified input handling with conflict resolution
- **Gamified Dashboard**: Interactive learning cards with XP progression
- **Progress Analytics**: Local tracking with detailed statistics
- **Accessibility Controls**: WCAG 2.1 AA compliant with multiple input methods

### ♿ Accessibility Features

- **Multiple Input Methods**: Eye tracking, voice commands, keyboard navigation
- **High Contrast Mode**: Enhanced visibility for low vision users
- **Adjustable Font Sizes**: 4 size levels for better readability
- **Screen Reader Support**: Full ARIA implementation and semantic HTML
- **Reduced Motion**: Respects user preferences for motion sensitivity
- **Keyboard Navigation**: Complete keyboard accessibility with focus management

### 🌐 PWA Capabilities

- **Offline Functionality**: Works without internet connection
- **Background Sync**: Analytics data syncing when online
- **Push Notifications**: Learning reminders and progress updates
- **Installable**: Can be installed as a native app
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Modern browser with camera/microphone support
- HTTPS connection (required for camera access)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development with HTTPS

The app requires HTTPS for camera access. The Vite config includes HTTPS by default for development.

## 🎮 Usage Guide

### Navigation Methods

#### 👁️ Eye Tracking
- **Look Left**: Navigate to previous item
- **Look Right**: Navigate to next item  
- **Look Center**: Select current item
- **Look Down**: Open dashboard/menu

#### 🎤 Voice Commands
- "next" / "forward" → Navigate forward
- "back" / "previous" → Navigate backward
- "select" / "choose" → Select current item
- "dashboard" / "menu" → Open main menu
- "repeat" / "read" → Read current content aloud

#### ⌨️ Keyboard Navigation
- **Arrow Keys**: Navigate in all directions
- **Enter/Space**: Select or activate
- **Tab**: Focus next element
- **Shift+Tab**: Focus previous element
- **Ctrl+D**: Toggle debug overlay
- **Ctrl+Shift+H**: Toggle high contrast
- **Ctrl+Shift+L**: Toggle large text

### Accessibility Settings

Access the accessibility panel via the wheelchair icon (bottom-left):

- **High Contrast Mode**: Black background with yellow accents
- **Font Size Control**: Small → Medium → Large → XL
- **Reduced Motion**: Disables animations and transitions
- **Screen Reader Mode**: Enhanced navigation for screen readers

## 🏗️ Architecture

### Core Modules

```
src/
├── core/
│   ├── eyeTracker.ts      # MediaPipe eye tracking
│   ├── voiceInterface.ts  # Web Speech API wrapper
│   ├── interactionManager.ts # Input coordination
│   └── analytics.ts       # Progress tracking
├── components/
│   ├── Dashboard.tsx      # Main learning interface
│   ├── LessonCard.tsx     # Interactive lesson cards
│   ├── ProgressBar.tsx    # XP and level display
│   ├── AccessibilityProvider.tsx # Settings context
│   ├── AccessibilityControls.tsx # Settings panel
│   └── DebugOverlay.tsx   # Development tools
├── types/
│   └── index.ts          # TypeScript definitions
└── utils/
    └── mockData.ts       # Sample lesson content
```

### Data Flow

1. **Input Detection**: Eye tracker, voice interface, or keyboard
2. **Event Processing**: Interaction manager handles conflicts and priorities
3. **Action Dispatch**: Mapped to dashboard actions (next, back, select, etc.)
4. **UI Updates**: React components respond to state changes
5. **Analytics Tracking**: Progress and interaction data stored locally

## 🧪 Testing & Debug

### Debug Mode

Press `Ctrl+D` or click the "Debug" button to access:

- Real-time eye tracking status
- Voice recognition state
- Interaction history
- Analytics data
- Manual action triggers
- Calibration controls

### Mock Mode

If camera/microphone access is denied, the app automatically falls back to keyboard-only mode with full functionality preserved.

### Cross-Browser Testing

Tested on:
- ✅ Chrome 90+ (full feature support)
- ✅ Edge 90+ (full feature support)  
- ⚠️ Firefox 88+ (limited MediaPipe support)
- ⚠️ Safari 14+ (limited Web Speech API)

## 📊 Analytics & Progress

### Tracked Metrics

- **XP System**: Points earned for interactions and completions
- **Session Data**: Duration, interaction count, gaze patterns
- **Learning Progress**: Completed lessons, difficulty progression
- **Accessibility Usage**: Input method preferences, setting changes

### Data Storage

All data is stored locally using:
- **localStorage**: User preferences and progress
- **IndexedDB**: Lesson content and offline data
- **Service Worker Cache**: Static assets and API responses

### Privacy

- No data is sent to external servers
- All processing happens locally
- Camera/microphone data is not stored
- Export/import functionality for data portability

## 🔧 Configuration

### Eye Tracking Calibration

1. Ensure good lighting and camera positioning
2. Look at the center of the screen
3. Click "Calibrate Eye Tracker" in debug mode
4. Test gaze zones with the debug overlay

### Voice Recognition Setup

1. Allow microphone access when prompted
2. Speak clearly and at normal volume
3. Use supported commands (see voice commands list)
4. Check browser compatibility for Web Speech API

### Accessibility Customization

All settings are automatically saved and restored:
- Theme preferences (high contrast, font size)
- Input method preferences
- Motion and animation settings
- Screen reader optimizations

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# The dist/ folder contains:
# - Optimized React bundle
# - Service worker for PWA
# - Manifest and icons
# - Static assets
```

### Hosting Requirements

- **HTTPS**: Required for camera/microphone access
- **Service Worker Support**: For offline functionality
- **Modern Browser Support**: ES2020+ features used

### PWA Installation

Users can install the app:
1. Visit the site in a supported browser
2. Look for "Install App" prompt or menu option
3. App will be available as a native application
4. Works offline after installation

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make changes and test thoroughly
5. Submit pull request with detailed description

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and accessibility
- **Prettier**: Code formatting
- **WCAG 2.1 AA**: Accessibility compliance required

### Testing Checklist

- [ ] Eye tracking works with camera
- [ ] Voice commands recognized correctly
- [ ] Keyboard navigation complete
- [ ] Screen reader compatibility
- [ ] High contrast mode functional
- [ ] Offline mode works
- [ ] Mobile responsive
- [ ] Cross-browser tested

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues or questions:
1. Check the debug overlay for system status
2. Verify browser compatibility
3. Test with keyboard fallback mode
4. Review console for error messages

## 🎯 Roadmap

- [ ] Advanced eye tracking calibration
- [ ] Multi-language voice support
- [ ] Custom lesson creation tools
- [ ] Progress sharing and collaboration
- [ ] Advanced analytics dashboard
- [ ] Integration with learning management systems