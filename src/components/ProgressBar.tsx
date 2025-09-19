import { useState, useEffect } from 'react';
import { analytics } from '../core/analytics';

interface ProgressBarProps {
  className?: string;
}

export function ProgressBar({ className = '' }: ProgressBarProps) {
  const [xpData, setXpData] = useState(analytics.getXPLevel());
  const [recentGain, setRecentGain] = useState<number | null>(null);

  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      if (type === 'xpGain') {
        setRecentGain(data.amount);
        setTimeout(() => setRecentGain(null), 2000);
      }
      
      setXpData(analytics.getXPLevel());
    };

    document.addEventListener('progressUpdate', handleProgressUpdate as EventListener);
    
    // Update every second to keep in sync
    const interval = setInterval(() => {
      setXpData(analytics.getXPLevel());
    }, 1000);

    return () => {
      document.removeEventListener('progressUpdate', handleProgressUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="font-bold text-lg">Level {xpData.level}</h3>
            <p className="text-sm text-gray-600">
              {xpData.currentXP} / {xpData.nextLevelXP} XP
            </p>
          </div>
        </div>
        
        {recentGain && (
          <div className="animate-bounce text-green-600 font-bold">
            +{recentGain} XP
          </div>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${xpData.progress}%` }}
          role="progressbar"
          aria-valuenow={xpData.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Experience progress: ${Math.round(xpData.progress)}%`}
        />
      </div>

      <div className="text-xs text-gray-500 text-center">
        {Math.round(xpData.progress)}% to next level
      </div>
    </div>
  );
}