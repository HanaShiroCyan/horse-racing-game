import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
import { getRanking } from '@/utils/gameLogic';
import { Trophy, RotateCcw, Home, Star, Sparkles, Crown } from 'lucide-react';

const ResultPage = () => {
  const navigate = useNavigate();
  const { players, resetGame } = useGameStore();
  const ranking = getRanking(players);
  const winner = ranking[0];
  const isPlayerWinner = winner && !winner.isAI;

  const handleRestart = () => {
    resetGame();
    navigate('/');
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-gradient-to-br from-yellow-500/40 to-amber-600/40',
          border: 'border-yellow-400',
          shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
          text: 'text-yellow-400',
          rankBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        };
      case 1:
        return {
          bg: 'bg-gradient-to-br from-gray-400/30 to-gray-500/30',
          border: 'border-gray-400',
          shadow: 'shadow-[0_0_20px_rgba(156,163,175,0.4)]',
          text: 'text-gray-300',
          rankBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-orange-600/30 to-amber-700/30',
          border: 'border-orange-400',
          shadow: 'shadow-[0_0_20px_rgba(251,146,60,0.4)]',
          text: 'text-orange-400',
          rankBg: 'bg-gradient-to-br from-orange-400 to-amber-600',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-amber-900/30 to-amber-950/30',
          border: 'border-amber-700/50',
          shadow: '',
          text: 'text-amber-300',
          rankBg: 'bg-gradient-to-br from-amber-700 to-amber-900',
        };
    }
  };

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] via-[#2d1810] to-[#1a0f0a] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* 庆祝彩带 */}
        {isPlayerWinner && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: `${Math.random() * 100}vw`, rotate: 0, opacity: 1 }}
                animate={{ y: '100vh', x: `${Math.random() * 100}vw`, rotate: 360 }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
                className="absolute text-2xl"
              >
                {['🎉', '🎊', '✨', '⭐', '🏆'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="relative max-w-3xl w-full z-10">
        {/* 胜利标题 */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-4"
          >
            <div className="text-7xl md:text-8xl drop-shadow-2xl">
              🏆
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 drop-shadow-lg mb-3">
            {isPlayerWinner ? '恭喜夺冠！' : '比赛结束'}
          </h1>
          <p className="text-xl text-amber-300/80">
            {isPlayerWinner ? '你击败了所有对手！' : '所有回合已完成'}
          </p>
        </motion.div>

        {/* 冠军展示 */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl p-6 mb-6 border-2 border-yellow-400/50 shadow-2xl backdrop-blur-sm relative overflow-hidden"
          >
            {/* 光晕效果 */}
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Crown className="w-12 h-12 text-yellow-400 absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-lg" />
                </motion.div>
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 flex items-center justify-center text-5xl shadow-2xl"
                  style={{
                    backgroundColor: winner.color,
                    boxShadow: `0 0 40px ${winner.color}80, inset 0 2px 0 rgba(255,255,255,0.3)`,
                  }}
                >
                  🐴
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <div className="text-sm text-yellow-300/80 mb-1">冠军</div>
                <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-2 drop-shadow-lg">
                  {winner.name}
                </h2>
                <div className="text-amber-200/70 mb-3">
                  跑法: {winner.runningStyle}
                  {winner.isAI && ' (AI)'}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-lg">
                    {winner.mileage}
                  </span>
                  <span className="text-amber-300/70">里程</span>
                </div>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 排名列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-amber-900/40 to-amber-950/60 rounded-3xl p-6 mb-6 border-2 border-amber-600/40 shadow-xl backdrop-blur-sm"
        >
          <h3 className="text-2xl font-bold text-amber-200 mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            最终排名
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </h3>

          <div className="space-y-3">
            {ranking.map((player, index) => {
              const style = getRankStyle(index);
              const maxMileage = ranking[0].mileage;
              const percentage = (player.mileage / maxMileage) * 100;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className={`relative p-4 rounded-2xl border-2 ${style.bg} ${style.border} ${style.shadow} transition-all`}
                >
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 ${style.rankBg} rounded-full flex items-center justify-center shadow-lg border-2 border-white/30`}
                      >
                        <span className="text-xl font-black text-white drop-shadow-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-2xl mt-1">{getMedalEmoji(index)}</div>
                    </div>

                    {/* 玩家信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-xl shadow-lg"
                          style={{ backgroundColor: player.color }}
                        >
                          🐴
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${style.text}`}>
                            {player.name}
                          </div>
                          <div className="text-sm text-amber-300/60">
                            {player.runningStyle}
                            {player.isAI && ' · AI'}
                          </div>
                        </div>
                      </div>
                      
                      {/* 进度条 */}
                      <div className="mt-2">
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 1 + index * 0.1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${player.color}aa, ${player.color})`,
                              boxShadow: `0 0 10px ${player.color}80`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 里程数 */}
                    <div className="text-right">
                      <div className={`text-3xl font-black ${style.text} drop-shadow-lg`}>
                        {player.mileage}
                      </div>
                      <div className="text-xs text-amber-400/60">里程</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex gap-4"
        >
          <motion.button
            onClick={handleRestart}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-black text-lg shadow-2xl hover:from-yellow-400 hover:to-orange-400 transition-all border-2 border-yellow-300/50 flex items-center justify-center gap-2"
            style={{
              boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
            }}
          >
            <RotateCcw className="w-6 h-6" />
            再来一局
          </motion.button>

          <motion.button
            onClick={handleRestart}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-br from-amber-800/50 to-amber-900/50 text-amber-200 rounded-2xl font-bold text-lg shadow-xl hover:from-amber-700/50 hover:to-amber-800/50 transition-all border-2 border-amber-600/40 flex items-center justify-center gap-2"
          >
            <Home className="w-6 h-6" />
            返回主页
          </motion.button>
        </motion.div>

        {/* 底部统计 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 text-center text-amber-400/40 text-sm"
        >
          总共有 {ranking.length} 匹赛马参与了比赛
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;
