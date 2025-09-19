import { useState, useEffect } from 'react';
import { eyeTracker } from '../core/eyeTracker';
import { voiceInterface } from '../core/voiceInterface';
import { whisperVoiceInterface } from '../core/whisperVoiceInterface';
import { interactionManager } from '../core/interactionManager';
import { analytics } from '../core/analytics';

interface DebugOverlayProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function DebugOverlay({ isVisible, onToggle }: DebugOverlayProps) {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDebugInfo({
        eyeTracker: eyeTracker.getDebugInfo(),
        interactionManager: interactionManager.getDebugInfo(),
        voiceInterface: {
          webSpeechListening: voiceInterface.isListeningActive(),
          webSpeechSupported: voiceInterface.isVoiceSupported(),
          whisperListening: whisperVoiceInterface.isListeningActive(),
          whisperSupported: whisperVoiceInterface.isVoiceSupported()
        },
        analytics: {
          progress: analytics.getProgress(),
          sessionStats: analytics.getSessionStats(),
          xpLevel: analytics.getXPLevel()
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Show debug overlay"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Debug Overlay</h3>
        <button
          onClick={onToggle}
          className="text-gray-300 hover:text-white focus:outline-none"
          aria-label="Hide debug overlay"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Eye Tracker Status */}
        <div>
          <h4 className="font-semibold text-yellow-400">Eye Tracker</h4>
          <div className="ml-2">
            <div>Initialized: {debugInfo.eyeTracker?.isInitialized ? '✅' : '❌'}</div>
            <div>Camera Mode: {debugInfo.eyeTracker?.mockMode ? '🖱️ Mouse' : '📹 Camera'}</div>
            <div>Calibrated: {debugInfo.eyeTracker?.isCalibrated ? '✅' : '❌'}</div>
            <div>Current Zone: {debugInfo.eyeTracker?.currentZone || 'NONE'}</div>
            <div>Gaze History: {debugInfo.eyeTracker?.gazeHistory?.length || 0} points</div>
          </div>
        </div>

        {/* Voice Interface Status */}
        <div>
          <h4 className="font-semibold text-green-400">Voice Interface</h4>
          <div className="ml-2">
            <div>🤖 Whisper: {debugInfo.voiceInterface?.whisperSupported ? '✅' : '❌'} | {debugInfo.voiceInterface?.whisperListening ? '🎤' : '🔇'}</div>
            <div>🌐 Web Speech: {debugInfo.voiceInterface?.webSpeechSupported ? '✅' : '❌'} | {debugInfo.voiceInterface?.webSpeechListening ? '🎤' : '🔇'}</div>
          </div>
        </div>

        {/* Interaction Manager Status */}
        <div>
          <h4 className="font-semibold text-blue-400">Interaction Manager</h4>
          <div className="ml-2">
            <div>Initialized: {debugInfo.interactionManager?.isInitialized ? '✅' : '❌'}</div>
            <div>Has Handler: {debugInfo.interactionManager?.hasHandler ? '✅' : '❌'}</div>
            <div>Last Action: {debugInfo.interactionManager?.lastInteraction?.action || 'None'}</div>
            <div>History: {debugInfo.interactionManager?.historyLength || 0} events</div>
          </div>
        </div>

        {/* Analytics */}
        <div>
          <h4 className="font-semibold text-purple-400">Analytics</h4>
          <div className="ml-2">
            <div>Total XP: {debugInfo.analytics?.progress?.totalXP || 0}</div>
            <div>Level: {debugInfo.analytics?.xpLevel?.level || 1}</div>
            <div>Interactions: {debugInfo.analytics?.progress?.totalInteractions || 0}</div>
            <div>Sessions: {debugInfo.analytics?.progress?.sessionsCompleted || 0}</div>
          </div>
        </div>

        {/* Manual Controls */}
        <div>
          <h4 className="font-semibold text-red-400">Manual Controls</h4>
          <div className="ml-2 space-y-1">
            <button
              onClick={() => interactionManager.triggerAction('NEXT')}
              className="block w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Trigger NEXT
            </button>
            <button
              onClick={() => interactionManager.triggerAction('BACK')}
              className="block w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Trigger BACK
            </button>
            <button
              onClick={() => interactionManager.triggerAction('SELECT')}
              className="block w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Trigger SELECT
            </button>
            <button
              onClick={() => whisperVoiceInterface.startListening()}
              className="block w-full text-left px-2 py-1 bg-purple-700 rounded hover:bg-purple-600"
            >
              Start Whisper Recognition
            </button>
            <button
              onClick={() => voiceInterface.startListening()}
              className="block w-full text-left px-2 py-1 bg-green-700 rounded hover:bg-green-600"
            >
              Start Web Speech API
            </button>
            <button
              onClick={() => whisperVoiceInterface.speak('Testing Whisper voice synthesis')}
              className="block w-full text-left px-2 py-1 bg-purple-700 rounded hover:bg-purple-600"
            >
              Test Whisper TTS
            </button>
            <div className="text-xs text-gray-400 mt-2">
              <strong>Keyboard Shortcuts:</strong><br/>
              Ctrl+1: Next | Ctrl+2: Back<br/>
              Ctrl+3: Select | Ctrl+4: Dashboard<br/>
              Ctrl+5: Repeat | Mouse: Gaze simulation
            </div>
            <button
              onClick={() => eyeTracker.calibrate()}
              className="block w-full text-left px-2 py-1 bg-blue-700 rounded hover:bg-blue-600"
            >
              Calibrate Eye Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}