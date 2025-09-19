import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { AccessibilityControls } from './components/AccessibilityControls';
import { DebugOverlay } from './components/DebugOverlay';
import { interactionManager } from './core/interactionManager';
import './styles/globals.css';

function App() {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize interaction systems
        await interactionManager.startInteractionSystems();
        
        // Add keyboard shortcuts for accessibility
        const handleKeyDown = (event: KeyboardEvent) => {
          // Toggle debug overlay with Ctrl+D
          if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            setIsDebugVisible(prev => !prev);
          }
          
          // Quick accessibility shortcuts
          if (event.ctrlKey && event.shiftKey) {
            switch (event.key) {
              case 'H': // High contrast
                document.documentElement.classList.toggle('high-contrast');
                break;
              case 'L': // Large text
                document.documentElement.classList.toggle('text-large');
                break;
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Cleanup function
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          interactionManager.stopInteractionSystems();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to initialize accessibility features. Some functionality may be limited.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initializing Adaptive Learning Platform
          </h2>
          <p className="text-gray-600">
            Setting up eye tracking, voice recognition, and accessibility features...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <div className="App">
        {/* Error Banner */}
        {initError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm">{initError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        <Dashboard />

        {/* Accessibility Controls */}
        <AccessibilityControls />

        {/* Debug Overlay */}
        <DebugOverlay 
          isVisible={isDebugVisible} 
          onToggle={() => setIsDebugVisible(!isDebugVisible)} 
        />

        {/* Skip Links for Screen Readers */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        {/* Live Region for Announcements */}
        <div 
          id="live-region" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        ></div>

        {/* Instructions for Screen Readers */}
        <div className="sr-only">
          <h1>Adaptive Hands-Free Learning Platform</h1>
          <p>
            This application supports multiple input methods including eye tracking, voice commands, and keyboard navigation.
            Use Tab to navigate between elements, Enter or Space to activate buttons, and arrow keys for directional navigation.
            Press Ctrl+D to toggle debug information.
          </p>
        </div>
      </div>
    </AccessibilityProvider>
  );
}

export default App;