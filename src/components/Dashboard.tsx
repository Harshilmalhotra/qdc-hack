import { useState, useEffect, useCallback } from 'react';
import { LessonCard } from './LessonCard';
import { ProgressBar } from './ProgressBar';
import { interactionManager } from '../core/interactionManager';
import { analytics } from '../core/analytics';
import { voiceInterface } from '../core/voiceInterface';
import { whisperVoiceInterface } from '../core/whisperVoiceInterface';
import { mockLessons } from '../utils/mockData';
import type { LessonCard as LessonCardType } from '../types';

export function Dashboard() {
  const [lessons, setLessons] = useState<LessonCardType[]>(mockLessons);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gazedIndex, setGazedIndex] = useState<number | null>(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const [voiceActive, setVoiceActive] = useState(true);

  // Handle dashboard actions from interaction manager
  const handleDashboardAction = useCallback((action: string) => {
    switch (action) {
      case 'goNext':
        setSelectedIndex(prev => Math.min(prev + 1, lessons.length - 1));
        break;
      case 'goBack':
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'selectCurrent':
        handleLessonSelect(lessons[selectedIndex]);
        break;
      case 'openDashboard':
        // Scroll to top and announce
        window.scrollTo({ top: 0, behavior: 'smooth' });
        announceToScreenReader('Dashboard opened. You are now at the top of the lesson list.');
        break;
      case 'repeatContent':
        handleRepeatContent();
        break;
      case 'stopAction':
        handleStopAction();
        break;
      case 'startAction':
        handleStartAction();
        break;
      case 'showFallbackControls':
        // Show keyboard instructions or alternative controls
        announceToScreenReader('Fallback controls active. Use arrow keys to navigate, Enter to select.');
        break;
    }
  }, [lessons, selectedIndex]);

  // Register dashboard handler with interaction manager
  useEffect(() => {
    interactionManager.registerDashboardHandler(handleDashboardAction);
  }, [handleDashboardAction]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setShowOfflineBanner(false);
    const handleOffline = () => setShowOfflineBanner(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle gaze zone changes for visual feedback
  useEffect(() => {
    const handleGazeZone = (event: CustomEvent) => {
      const { zone } = event.detail;
      console.log('Dashboard received gaze zone:', zone);

      // Provide visual feedback for gaze zones
      if (zone === 'LEFT' && selectedIndex > 0) {
        setGazedIndex(selectedIndex - 1);
      } else if (zone === 'RIGHT' && selectedIndex < lessons.length - 1) {
        setGazedIndex(selectedIndex + 1);
      } else if (zone === 'CENTER') {
        setGazedIndex(selectedIndex);
      } else {
        setGazedIndex(null);
      }
    };

    document.addEventListener('gazeZoneChange', handleGazeZone as EventListener);
    return () => document.removeEventListener('gazeZoneChange', handleGazeZone as EventListener);
  }, [selectedIndex, lessons.length]);

  // Handle keyboard shortcuts for stop/start
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to stop voice commands
      if (event.key === 'Escape') {
        event.preventDefault();
        handleStopAction();
      }
      // Space key to start/resume voice commands
      else if (event.key === ' ' && event.ctrlKey) {
        event.preventDefault();
        handleStartAction();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLessonSelect = (lesson: LessonCardType) => {
    if (lesson.completed) {
      announceToScreenReader(`${lesson.title} is already completed.`);
      return;
    }

    // Simulate lesson start
    announceToScreenReader(`Starting ${lesson.title}. This is a ${lesson.difficulty} ${lesson.type}.`);

    // For demo purposes, mark as completed immediately
    handleLessonComplete(lesson.id);
  };

  const handleLessonComplete = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || lesson.completed) return;

    setLessons(prev => prev.map(l =>
      l.id === lessonId ? { ...l, completed: true } : l
    ));

    analytics.completeLesson(lessonId, lesson.xpReward);
    announceToScreenReader(`Congratulations! You completed ${lesson.title} and earned ${lesson.xpReward} XP!`);
  };

  const handleRepeatContent = async () => {
    const currentLesson = lessons[selectedIndex];
    if (currentLesson) {
      const text = `Currently selected: ${currentLesson.title}. ${currentLesson.description}`;
      await voiceInterface.speak(text);
    }
  };

  const handleStopAction = () => {
    console.log('🛑 STOP action triggered!');

    // Stop any ongoing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('🔇 Speech synthesis cancelled');
    }

    // Stop both voice recognition interfaces
    voiceInterface.stopListening();
    whisperVoiceInterface.stopListening();
    setVoiceActive(false);
    console.log('🎤 All voice recognition stopped');

    // Announce the stop action
    announceToScreenReader('Voice commands stopped. Press Escape to stop or Ctrl+Space to start.');
  };

  const handleStartAction = () => {
    console.log('🎤 START action triggered!');

    // Start both voice recognition interfaces
    voiceInterface.startListening();
    whisperVoiceInterface.startListening();
    setVoiceActive(true);
    console.log('🎤 Voice recognition started');

    // Announce the start action
    announceToScreenReader('Voice commands activated. You can now use voice commands.');
  };

  const announceToScreenReader = (message: string) => {
    // Create a live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const completedCount = lessons.filter(l => l.completed).length;
  const progressPercentage = (completedCount / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                You are currently offline. Some features may be limited, but you can continue learning with cached content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Adaptive Learning Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Navigate with your eyes, voice, or keyboard. Your progress is automatically saved.
        </p>
      </header>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ProgressBar className="lg:col-span-2" />

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-lg mb-2">Course Progress</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {completedCount}/{lessons.length}
          </div>
          <div className="text-sm text-gray-600 mb-3">Lessons Completed</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Course progress: ${Math.round(progressPercentage)}%`}
            />
          </div>
        </div>
      </div>

      {/* Navigation Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Navigation Help & Testing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 mb-4">
          <div>
            <strong>👁️ Eye Tracking (Demo):</strong> Move mouse to screen edges - Left (back), Right (next), Center (select), Bottom (dashboard)
          </div>
          <div>
            <strong>🤖 Whisper Voice:</strong> "next", "back", "select", "complete", "dashboard" (low latency AI)
          </div>
          <div>
            <strong>⌨️ Keyboard:</strong> Arrow keys to navigate, Enter/Space to select, Escape to stop voice, Ctrl+Space to start voice
          </div>
        </div>
        <div className="bg-green-100 border border-green-300 rounded p-3 text-green-800 text-sm">
          <strong>🎮 How to Use the Demo:</strong>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <strong>👁️ Gaze Simulation:</strong>
              <ul className="list-disc list-inside text-xs mt-1">
                <li>Move mouse to <strong>far LEFT edge</strong> → Previous</li>
                <li>Move mouse to <strong>far RIGHT edge</strong> → Next</li>
                <li>Move mouse to <strong>far BOTTOM edge</strong> → Dashboard</li>
                <li>Mouse to center → Select</li>
              </ul>
            </div>
            <div>
              <strong>🎤 Voice Commands:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${voiceActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {voiceActive ? '🟢 Active' : '🔴 Stopped'}
              </span>
              <ul className="list-disc list-inside text-xs mt-1">
                <li>"next" or "back" → Navigate</li>
                <li>"select" or "complete" → Choose lesson</li>
                <li>"read aloud" or "repeat" → Read content</li>
                <li>"dashboard" → Go to top</li>
                <li>"stop" or "halt" → Stop voice commands</li>
                <li>"start" or "resume" → Resume voice commands</li>
              </ul>
            </div>
          </div>
          <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
            <strong>💡 Current:</strong> HTTP mode with mouse simulation.
            <strong>For camera/mic:</strong> Edit vite.config.ts, set https: true, restart server, accept certificate.
          </div>
        </div>
      </div>

      {/* Lesson Grid */}
      <main>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Lessons</h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="grid"
          aria-label="Lesson selection grid"
        >
          {lessons.map((lesson, index) => (
            <div key={lesson.id} role="gridcell">
              <LessonCard
                lesson={lesson}
                isSelected={index === selectedIndex}
                isGazed={index === gazedIndex}
                onClick={() => {
                  setSelectedIndex(index);
                  handleLessonSelect(lesson);
                }}
                onComplete={() => handleLessonComplete(lesson.id)}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Use Tab to navigate between lessons, Enter or Space to select a lesson.
        Current selection: {lessons[selectedIndex]?.title}
      </div>
    </div>
  );
}