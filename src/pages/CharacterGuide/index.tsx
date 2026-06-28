import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CHARACTERS } from '@/config/characters';
import { RUNNING_STYLES } from '@/config/runningStyles';
import { ArrowLeft, Book, Zap, Trophy, Target, Wind } from 'lucide-react';

const CharacterGuide = () => {
  const navigate = useNavigate();

  const getIconForStyle = (styleType: string) => {
    switch (styleType) {
      case '逃':
        return <Zap className="w-5 h-5" />;
      case '先':
        return <Trophy className="w-5 h-5" />;
      case '差':
        return <Target className="w-5 h-5" />;
      case '追':
        return <Wind className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const styles = ['逃', '先', '差', '追'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] via-[#2d1810] to-[#1a0f0a] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 drop-shadow-lg mb-2 flex items-center justify-center gap-3">
            <Book className="w-10 h-10 text-yellow-400" />
            角色图鉴
          </h1>
          <p className="text-lg text-amber-300/80 font-medium">
            查看所有赛马角色的技能详情
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回主页</span>
        </motion.button>

        <div className="space-y-8">
          {styles.map((style, styleIndex) => {
            const styleConfig = RUNNING_STYLES[style];
            const characters = CHARACTERS.filter(c => c.runningStyle === style);

            return (
              <motion.div
                key={style}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: styleIndex * 0.15 }}
                className="rounded-2xl overflow-hidden border-2 border-amber-600/30"
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{
                    background: `linear-gradient(90deg, ${styleConfig.color}40 0%, ${styleConfig.color}20 100%)`,
                    borderBottom: `2px solid ${styleConfig.color}40`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${styleConfig.color}30` }}
                  >
                    <div style={{ color: styleConfig.color }}>
                      {getIconForStyle(style)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-amber-100">
                      {styleConfig.name}
                    </h2>
                    <p className="text-sm text-amber-300/70">
                      {styleConfig.description} · 奖励 +{styleConfig.bonusMileage}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4"
                  style={{
                    background: 'linear-gradient(180deg, rgba(120, 53, 15, 0.2) 0%, rgba(69, 26, 3, 0.3) 100%)',
                  }}
                >
                  {characters.map((character, charIndex) => (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: styleIndex * 0.15 + charIndex * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="rounded-xl p-4 border border-amber-700/30 hover:border-amber-500/50 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${character.color}15 0%, ${character.color}05 100%)`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                          style={{
                            backgroundColor: `${character.color}30`,
                            border: `2px solid ${character.color}60`,
                          }}
                        >
                          {character.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-amber-100 truncate">
                              {character.name}
                            </h3>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${styleConfig.color}40`, color: styleConfig.color }}
                            >
                              {styleConfig.name}
                            </span>
                          </div>
                          <div className="bg-black/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-400 text-sm font-bold">⚡ {character.skill.name}</span>
                            </div>
                            <p className="text-xs text-amber-300/80 leading-relaxed">
                              {character.skill.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-amber-700/50 to-amber-900/50 hover:from-amber-600/60 hover:to-amber-800/60 text-amber-200 font-bold text-lg border border-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          返回开始游戏
        </motion.button>
      </div>
    </div>
  );
};

export default CharacterGuide;