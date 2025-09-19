import { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';

export function AccessibilityControls() {
  const { settings, toggleHighContrast, increaseFontSize, decreaseFontSize, updateSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`${isOpen ? 'Close' : 'Open'} accessibility controls`}
        aria-expanded={isOpen}
      >
        <span className="text-xl">♿</span>
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Accessibility Settings</h3>
          
          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                High Contrast Mode
              </label>
              <button
                id="high-contrast"
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.highContrast}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Font Size Controls */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Font Size: {settings.fontSize}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize === 'small'}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Decrease font size"
                >
                  A-
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={settings.fontSize === 'xl'}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                Reduce Motion
              </label>
              <button
                id="reduced-motion"
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.reducedMotion}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Screen Reader Mode Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="screen-reader" className="text-sm font-medium text-gray-700">
                Screen Reader Mode
              </label>
              <button
                id="screen-reader"
                onClick={() => updateSettings({ screenReaderMode: !settings.screenReaderMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.screenReaderMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={settings.screenReaderMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.screenReaderMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Keyboard Shortcuts</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Arrow Keys: Navigate</div>
                <div>• Enter/Space: Select</div>
                <div>• Tab: Focus next element</div>
                <div>• Shift+Tab: Focus previous element</div>
                <div>• Escape: Close dialogs</div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}