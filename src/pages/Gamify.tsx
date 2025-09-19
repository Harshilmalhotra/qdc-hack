import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Trophy, Target, Zap, Users, Star, Award, TrendingUp, Calendar } from 'lucide-react';
import StatisticCard from '../components/ui/StatisticCard';
import StreakCard from '../components/dashboard/StreakCard';
import LeaderboardCard from '../components/dashboard/LeaderboardCard';
import MemoryGame from '../components/gamify/MemoryGame';

const Gamify = () => {
  const { darkMode } = useTheme();
  const { user } = useUser();

  const challenges = [
    {
      id: 1,
      title: "7-Day Learning Streak",
      description: "Learn something new for 7 consecutive days",
      progress: 3,
      target: 7,
      reward: "100 XP + Consistency Badge",
      icon: <Calendar className="w-6 h-6" />,
      difficulty: "Easy",
      timeLeft: "4 days left"
    },
    {
      id: 2,
      title: "Course Completion Master",
      description: "Complete 3 courses this month",
      progress: 1,
      target: 3,
      reward: "250 XP + Scholar Badge",
      icon: <Target className="w-6 h-6" />,
      difficulty: "Medium",
      timeLeft: "12 days left"
    },
    {
      id: 3,
      title: "Quiz Champion",
      description: "Score 90% or higher on 10 quizzes",
      progress: 6,
      target: 10,
      reward: "150 XP + Quiz Master Badge",
      icon: <Star className="w-6 h-6" />,
      difficulty: "Hard",
      timeLeft: "8 days left"
    },
    {
      id: 4,
      title: "Memory Master",
      description: "Complete memory game with 800+ score 3 times",
      progress: 0,
      target: 3,
      reward: "200 XP + Memory Champion Badge",
      icon: <Trophy className="w-6 h-6" />,
      difficulty: "Medium",
      timeLeft: "14 days left"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      earned: true,
      xp: 50,
      icon: "🎯"
    },
    {
      id: 2,
      title: "Speed Learner",
      description: "Complete 5 lessons in one day",
      earned: true,
      xp: 100,
      icon: "⚡"
    },
    {
      id: 3,
      title: "Memory Rookie",
      description: "Complete your first memory game",
      earned: false,
      xp: 75,
      icon: "🧠"
    },
    {
      id: 4,
      title: "Perfect Memory",
      description: "Complete memory game with perfect score (1000)",
      earned: false,
      xp: 250,
      icon: "🏆"
    },
    {
      id: 5,
      title: "Dedication",
      description: "Maintain a 30-day learning streak",
      earned: false,
      xp: 500,
      icon: "🔥"
    },
    {
      id: 6,
      title: "Knowledge Seeker",
      description: "Complete 50 lessons",
      earned: false,
      xp: 300,
      icon: "📚"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'Hard':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          🎮 Gamify Your Learning
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Level up your skills with challenges, achievements, and friendly competition!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatisticCard
          label="Total XP"
          value={user?.total_xp || 0}
          icon={<Zap className="w-6 h-6 text-indigo-600" />}
        />
        <StatisticCard
          label="Current Level"
          value={user?.level || 1}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
        />
        <StatisticCard
          label="Achievements"
          value="12/24"
          icon={<Award className="w-6 h-6 text-amber-600" />}
        />
        <StatisticCard
          label="Rank"
          value="#8"
          icon={<Users className="w-6 h-6 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Challenges */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Target className="w-6 h-6 mr-2 text-indigo-600" />
            Active Challenges
          </h2>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-indigo-600 dark:text-indigo-400">
                      {challenge.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {challenge.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Progress: {challenge.progress}/{challenge.target}
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {challenge.timeLeft}
                    </span>
                  </div>
                  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Reward: {challenge.reward}
                  </span>
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
            <Trophy className="w-6 h-6 mr-2 text-amber-600" />
            Achievements
          </h2>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border flex items-center space-x-4 ${
                  achievement.earned
                    ? `${darkMode ? 'border-amber-700 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`
                    : `${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`
                } ${!achievement.earned ? 'opacity-60' : ''}`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    achievement.earned 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    +{achievement.xp} XP
                  </div>
                  {achievement.earned && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Earned!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Game Section */}
      <div className="mb-6">
        <MemoryGame 
          onGameComplete={(score, moves, time) => {
            console.log('Game completed!', { score, moves, time });
            // You could add achievements or save stats here
          }}
        />
      </div>

      {/* Bottom Row - Streak and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakCard 
          streak={5}
          longestStreak={12}
          weeklyActivity={[2, 1, 3, 0, 2, 1, 4]}
        />
        <LeaderboardCard 
          leaders={[
            { id: 1, name: "Alex Johnson", avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=6366f1&color=fff", score: 2450, rank: 1 },
            { id: 2, name: "Sarah Chen", avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=fff", score: 2380, rank: 2 },
            { id: 3, name: "Mike Rodriguez", avatar: "https://ui-avatars.com/api/?name=Mike+Rodriguez&background=f59e0b&color=fff", score: 2200, rank: 3 },
            { id: 4, name: "Emma Wilson", avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=ef4444&color=fff", score: 2150, rank: 4 },
            { id: 5, name: "David Kim", avatar: "https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff", score: 2100, rank: 5 }
          ]}
        />
      </div>
    </div>
  );
};

export default Gamify;