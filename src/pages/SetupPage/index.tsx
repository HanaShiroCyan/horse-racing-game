import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
import { RUNNING_STYLES, DEFAULT_ROUND_RANGE } from '@/config/runningStyles';
import { getCharactersByStyle } from '@/config/characters';
import { GameConfig, Character } from '@/types';
import { ChevronRight, Zap, Target, Wind, Trophy, MapPin, Info, Gamepad2, ArrowLeft, Book } from 'lucide-react';

const SetupPage = () => {
  const navigate = useNavigate();
  const initGame = useGameStore(state => state.initGame);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState(DEFAULT_ROUND_RANGE.default);
  const [showRules, setShowRules] = useState(false);

  const selectedStyleConfig = selectedStyle ? RUNNING_STYLES[selectedStyle] : null;
  const characters = selectedStyle ? getCharactersByStyle(selectedStyle) : [];

  const handleStartGame = () => {
    if (!selectedStyle || !selectedCharacter || selectedPosition === null) {
      alert('请完成所有选择！');
      return;
    }

    const config: GameConfig = {
      totalRounds,
      aiDifficulty: 'medium',
    };

    initGame(config, selectedCharacter, selectedPosition);
    navigate('/game');
  };

  const getIconForStyle = (styleType: string) => {
    switch (styleType) {
      case '逃':
        return <Zap className="w-10 h-10" />;
      case '先':
        return <Trophy className="w-10 h-10" />;
      case '差':
        return <Target className="w-10 h-10" />;
      case '追':
        return <Wind className="w-10 h-10" />;
      default:
        return <Trophy className="w-10 h-10" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] via-[#2d1810] to-[#1a0f0a] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full z-10">
        {/* 游戏标题 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 drop-shadow-lg mb-2">
              🏇 赛马风云 🏇
            </h1>
          </motion.div>
          <p className="text-xl text-amber-300/80 font-medium mb-4">
            选择你的战马，夺取胜利！
          </p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/guide')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-800/60 to-amber-900/60 hover:from-amber-700/70 hover:to-amber-800/70 text-amber-200 font-bold border border-amber-500/40 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <Book className="w-5 h-5 text-yellow-400" />
            角色图鉴
          </motion.button>
        </motion.div>

        {/* 步骤指示 */}
        <div className="flex justify-center gap-4 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            !selectedStyle ? 'bg-yellow-500 text-black font-bold' : 'bg-amber-900/50 text-amber-300'
          }`}>
            <span className="text-lg">1️⃣</span>
            <span>选择跑法</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            selectedStyle && !selectedCharacter ? 'bg-yellow-500 text-black font-bold' : 'bg-amber-900/50 text-amber-300'
          }`}>
            <span className="text-lg">2️⃣</span>
            <span>选择角色</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            selectedCharacter && selectedPosition === null ? 'bg-yellow-500 text-black font-bold' : 'bg-amber-900/50 text-amber-300'
          }`}>
            <span className="text-lg">3️⃣</span>
            <span>选择位置</span>
          </div>
        </div>

        {/* 跑法选择 */}
        {!selectedStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              {Object.values(RUNNING_STYLES).map((style, index) => (
                <motion.div
                  key={style.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedStyle(style.type)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer rounded-2xl p-5 transition-all duration-300 overflow-hidden border-2 border-amber-700/40 hover:border-amber-500/60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.3) 0%, rgba(69, 26, 3, 0.5) 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-3 bg-amber-900/50"
                      style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}
                    >
                      <div style={{ color: style.color }} className="drop-shadow-lg">
                        {getIconForStyle(style.type)}
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-black mb-1 text-amber-100">
                      {style.name}
                    </h3>
                    <p className="text-xs md:text-sm text-amber-300/70 text-center leading-tight">
                      {style.description}
                    </p>
                    <div className="mt-3 px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${style.color}30`,
                        color: style.color,
                        border: `1px solid ${style.color}50`,
                      }}
                    >
                      奖励 +{style.bonusMileage}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 角色选择 */}
        {selectedStyle && !selectedCharacter && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStyle('')}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回选择跑法</span>
              </motion.button>
              <h3 className="text-xl font-bold text-amber-200 flex-1 text-center">
                选择「{RUNNING_STYLES[selectedStyle].name}」角色
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {characters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedCharacter(character)}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer rounded-2xl p-5 transition-all duration-300 overflow-hidden border-2 border-amber-700/40 hover:border-amber-500/60 bg-gradient-to-br from-amber-900/40 to-amber-950/60"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
                      style={{
                        backgroundColor: `${character.color}30`,
                        border: `2px solid ${character.color}60`,
                      }}
                    >
                      {character.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                        {character.name}
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${character.color}40`, color: character.color }}
                        >
                          {RUNNING_STYLES[character.runningStyle].name}
                        </span>
                      </h4>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-400 text-sm">⚡ {character.skill.name}</span>
                        </div>
                        <p className="text-xs text-amber-300/70 leading-relaxed">
                          {character.skill.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 起始位置选择 */}
        {selectedStyleConfig && selectedCharacter && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-amber-900/40 to-amber-950/60 rounded-2xl p-5 mb-6 border-2 border-amber-600/40 shadow-xl backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCharacter(null)}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回选择角色</span>
              </motion.button>
              <div className="flex-1 text-center">
                <h3 className="text-xl font-bold text-amber-200 flex items-center justify-center gap-2">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                  选择起始位置
                </h3>
                <p className="text-sm text-amber-400/70">
                  {selectedCharacter.avatar} {selectedCharacter.name}
                </p>
              </div>
            </div>

            <p className="text-amber-300/70 text-sm mb-5">
              在「{selectedStyleConfig.name}」区域的三个格子中选择一个作为起跑位置：
            </p>
            <div className="flex gap-4 justify-center">
              {selectedStyleConfig.zonePositions.map((pos, index) => (
                <motion.button
                  key={pos}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPosition(pos)}
                  className={`relative w-24 h-28 md:w-28 md:h-32 rounded-2xl border-2 transition-all duration-300 ${
                    selectedPosition === pos
                      ? 'border-yellow-400 shadow-2xl'
                      : 'border-amber-700/50 hover:border-amber-500/70'
                  }`}
                  style={{
                    background: selectedPosition === pos
                      ? `linear-gradient(180deg, ${selectedStyleConfig.color}50 0%, ${selectedStyleConfig.color}30 100%)`
                      : 'linear-gradient(180deg, rgba(120, 53, 15, 0.3) 0%, rgba(69, 26, 3, 0.5) 100%)',
                    boxShadow: selectedPosition === pos
                      ? `0 0 25px ${selectedStyleConfig.color}60, inset 0 2px 0 rgba(255,255,255,0.2)`
                      : 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span
                      className="text-4xl md:text-5xl font-black drop-shadow-lg"
                      style={{ color: selectedStyleConfig.color }}
                    >
                      {pos + 1}
                    </span>
                    <span className="text-sm text-amber-300/70 mt-1">号位</span>
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-400/60">
                      <span>🐴</span>
                      <span>起点</span>
                    </div>
                  </div>

                  {selectedPosition === pos && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-300"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-amber-400/50 text-center mt-4">
              赛道位置: {selectedStyleConfig.zonePositions.map(p => `第${p + 1}格`).join(' / ')}
            </p>
          </motion.div>
        )}

        {/* 回合数设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-amber-900/40 to-amber-950/60 rounded-2xl p-5 mb-6 border-2 border-amber-600/40 shadow-xl backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-yellow-400" />
            回合数设置
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <input
              type="range"
              min={DEFAULT_ROUND_RANGE.min}
              max={DEFAULT_ROUND_RANGE.max}
              value={totalRounds}
              onChange={e => setTotalRounds(Number(e.target.value))}
              className="flex-1 h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #f59e0b ${(totalRounds - DEFAULT_ROUND_RANGE.min) / (DEFAULT_ROUND_RANGE.max - DEFAULT_ROUND_RANGE.min) * 100}%, #78350f ${(totalRounds - DEFAULT_ROUND_RANGE.min) / (DEFAULT_ROUND_RANGE.max - DEFAULT_ROUND_RANGE.min) * 100}%, #451a03 100%)`,
              }}
            />
            <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 px-5 py-2 rounded-xl border border-yellow-500/40">
              <span className="text-3xl font-black text-yellow-400">{totalRounds}</span>
              <span className="text-sm text-amber-300/70">回合</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {[5, 6, 7, 8, 9, 10].map(round => (
              <motion.button
                key={round}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTotalRounds(round)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  totalRounds === round
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-amber-900/50 text-amber-200 hover:bg-amber-800/60 border border-amber-600/40'
                }`}
              >
                {round}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(round => (
              <motion.button
                key={round}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTotalRounds(round)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  totalRounds === round
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-amber-900/50 text-amber-200 hover:bg-amber-800/60 border border-amber-600/40'
                }`}
              >
                {round}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 规则说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-amber-900/40 to-amber-950/60 rounded-2xl mb-6 border-2 border-amber-600/40 shadow-xl backdrop-blur-sm overflow-hidden"
        >
          <div
            className="flex items-center justify-between cursor-pointer p-5"
            onClick={() => setShowRules(!showRules)}
          >
            <h3 className="text-xl font-bold text-amber-200 flex items-center gap-2">
              <Info className="w-6 h-6 text-yellow-400" />
              游戏规则
            </h3>
            <motion.div
              animate={{ rotate: showRules ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-6 h-6 text-amber-400" />
            </motion.div>
          </div>
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-amber-200/80 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">1</span>
                    <span>选择跑法和角色，每个角色都有独特的技能。</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">2</span>
                    <span>起跑时进行随机判定决定出手顺序。</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">3</span>
                    <span>每回合投掷骰子，选择向左或向右移动。</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">4</span>
                    <span>移动时如果到达赛道尽头，会转身回走剩余步数。</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">5</span>
                    <span>在对应跑法区域结算时获得奖励里程，否则获得基础里程。</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 flex-shrink-0 bg-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 font-bold text-xs">6</span>
                    <span>角色技能会在特定条件下触发，带来额外效果！</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 开始按钮 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={handleStartGame}
          disabled={!selectedStyle || !selectedCharacter || selectedPosition === null}
          whileHover={selectedStyle && selectedCharacter && selectedPosition !== null ? { scale: 1.03, y: -2 } : {}}
          whileTap={selectedStyle && selectedCharacter && selectedPosition !== null ? { scale: 0.98 } : {}}
          className={`w-full py-5 rounded-2xl text-2xl font-black transition-all duration-300 relative overflow-hidden ${
            selectedStyle && selectedCharacter && selectedPosition !== null
              ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow-2xl cursor-pointer'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
          style={{
            boxShadow: selectedStyle && selectedCharacter && selectedPosition !== null
              ? '0 10px 40px rgba(251, 191, 36, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
              : 'none',
          }}
        >
          {selectedStyle && selectedCharacter && selectedPosition !== null && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
          )}
          <span className="relative flex items-center justify-center gap-3">
            <span className="text-3xl">🏇</span>
            开始比赛！
            <span className="text-3xl">🏆</span>
          </span>
        </motion.button>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-amber-400/40 text-sm mt-6"
        >
          {!selectedStyle && '请选择一个跑法'}
          {selectedStyle && !selectedCharacter && '请选择一个角色'}
          {selectedCharacter && selectedPosition === null && '请选择起始位置'}
          {selectedStyle && selectedCharacter && selectedPosition !== null && '准备就绪！'}
        </motion.p>
      </div>
    </div>
  );
};

export default SetupPage;