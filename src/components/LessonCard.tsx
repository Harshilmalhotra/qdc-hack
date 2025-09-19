import { useState, useEffect } from 'react';
import type { LessonCard as LessonCardType } from '../types';
import { voiceInterface } from '../core/voiceInterface';

interface LessonCardProps {
  lesson: LessonCardType;
  isSelected: boolean;
  isGazed: boolean;
  onClick: () => void;
  onComplete: () => void;
}

export function LessonCard({ lesson, isSelected, isGazed, onClick, onComplete }: LessonCardProps) {
  const [isReading, setIsReading] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };

  const typeIcons = {
    lesson: '📚',
    quiz: '🧩'
  };

  const handleReadAloud = async () => {
    if (isReading) return;
    
    setIsReading(true);
    try {
      const text = `${lesson.title}. ${lesson.description}. This is a ${lesson.difficulty} ${lesson.type} worth ${lesson.xpReward} experience points.`;
      await voiceInterface.speak(text);
    } catch (error) {
      console.error('Failed to read lesson aloud:', error);
    } finally {
      setIsReading(false);
    }
  };

  useEffect(() => {
    // Auto-read when card is selected via gaze for accessibility
    if (isSelected && isGazed) {
      const timer = setTimeout(() => {
        handleReadAloud();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSelected, isGazed]);

  return (
    <div
      className={`
        lesson-card relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        ${isGazed ? 'bg-blue-50 border-blue-300 shadow-lg scale-105' : 'bg-white border-gray-200 hover:border-gray-300'}
        ${lesson.completed ? 'opacity-75' : ''}
        focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
      `}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${lesson.type}: ${lesson.title}. ${lesson.description}. Difficulty: ${lesson.difficulty}. Reward: ${lesson.xpReward} XP. ${lesson.completed ? 'Completed' : 'Not completed'}`}
    >
      {/* Completion Badge */}
      {lesson.completed && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          ✓
        </div>
      )}

      {/* Type Icon */}
      <div className="text-3xl mb-3">
        {typeIcons[lesson.type]}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2 text-gray-900">
        {lesson.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {lesson.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors[lesson.difficulty]}`}>
            {lesson.difficulty}
          </span>
          
          {/* Type Badge */}
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {lesson.type}
          </span>
        </div>

        {/* XP Reward */}
        <div className="flex items-center space-x-1 text-purple-600 font-semibold">
          <span className="text-sm">⭐</span>
          <span className="text-sm">{lesson.xpReward} XP</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReadAloud();
          }}
          disabled={isReading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Read lesson aloud"
        >
          {isReading ? '🔊 Reading...' : '🔊 Read Aloud'}
        </button>

        {!lesson.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Mark as complete"
          >
            ✓ Complete
          </button>
        )}
      </div>

      {/* Gaze Indicator */}
      {isGazed && (
        <div className="absolute inset-0 border-4 border-blue-400 rounded-xl pointer-events-none animate-pulse" />
      )}

      {/* Screen Reader Content */}
      <div className="sr-only">
        {lesson.completed ? 'This lesson has been completed.' : 'This lesson is available to start.'}
        Press Enter or Space to select this lesson.
        Press Tab to navigate to the next lesson.
      </div>
    </div>
  );
}