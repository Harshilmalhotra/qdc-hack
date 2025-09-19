import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RotateCcw, Trophy, Clock, Star } from 'lucide-react';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onGameComplete?: (score: number, moves: number, time: number) => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameComplete }) => {
  const { darkMode } = useTheme();
  
  const symbols = ['🧠', '📚', '🎯', '⭐', '🏆', '🚀'];
  
  const initializeCards = (): Card[] => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    return shuffled;
  };

  const [cards, setCards] = useState<Card[]>(initializeCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameCompleted, startTime]);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(card => card.id === first);
      const secondCard = cards.find(card => card.id === second);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Check for game completion
  useEffect(() => {
    if (matches === symbols.length && gameStarted) {
      setGameCompleted(true);
      const finalTime = elapsedTime;
      const score = calculateScore(moves, finalTime);
      
      if (onGameComplete) {
        onGameComplete(score, moves, finalTime);
      }
    }
  }, [matches, symbols.length, gameStarted, moves, elapsedTime, onGameComplete]);

  const calculateScore = (moveCount: number, timeInSeconds: number): number => {
    const baseScore = 1000;
    const movePenalty = moveCount * 10;
    const timePenalty = timeInSeconds * 2;
    return Math.max(100, baseScore - movePenalty - timePenalty);
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

  const resetGame = () => {
    setCards(initializeCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = (): { rating: string; color: string; icon: JSX.Element } => {
    if (!gameCompleted) return { rating: '', color: '', icon: <></> };
    
    const score = calculateScore(moves, elapsedTime);
    if (score >= 800) {
      return { rating: 'Excellent!', color: 'text-green-600', icon: <Trophy className="w-5 h-5" /> };
    } else if (score >= 600) {
      return { rating: 'Great!', color: 'text-blue-600', icon: <Star className="w-5 h-5" /> };
    } else if (score >= 400) {
      return { rating: 'Good!', color: 'text-yellow-600', icon: <Star className="w-5 h-5" /> };
    } else {
      return { rating: 'Keep practicing!', color: 'text-gray-600', icon: <Star className="w-5 h-5" /> };
    }
  };

  const performance = getPerformanceRating();

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
          🧠 Memory Challenge
        </h2>
        <button
          onClick={resetGame}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-3 h-3 mr-1 text-blue-600" />
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time</div>
          <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-3 h-3 mr-1 text-amber-600" />
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Moves</div>
          <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{moves}</div>
        </div>
        
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
          <div className="flex items-center justify-center mb-1">
            <Star className="w-3 h-3 mr-1 text-green-600" />
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Matches</div>
          <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {matches}/{symbols.length}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-xs mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-16 h-16 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-lg font-bold
              ${card.isFlipped || card.isMatched
                ? darkMode 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-500 text-white'
                : darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-400'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
              }
              ${card.isMatched ? 'ring-2 ring-green-500' : ''}
              ${flippedCards.includes(card.id) && !card.isMatched ? 'animate-pulse' : ''}
            `}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '?'}
          </div>
        ))}
      </div>

      {/* Game Completion Message */}
      {gameCompleted && (
        <div className={`p-3 rounded-lg border-2 border-dashed ${
          darkMode ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
        } text-center mb-4`}>
          <div className="flex items-center justify-center mb-1">
            {performance.icon}
            <span className={`ml-2 font-bold text-sm ${performance.color}`}>
              {performance.rating}
            </span>
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Completed in {moves} moves and {formatTime(elapsedTime)}
          </div>
          <div className={`text-sm font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Score: {calculateScore(moves, elapsedTime)}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameStarted && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-center`}>
          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Click on cards to flip them and find matching pairs. 
            Find all 6 pairs with fewer moves and less time for a higher score!
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;