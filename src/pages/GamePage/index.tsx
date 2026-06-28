import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
import { TRACK_CONFIG, getRunningStyleConfig } from '@/config/runningStyles';
import { Dice1, Dice2, Dice3, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Player } from '@/types';
import { MoveDirection, calculateMove, calculateMileage } from '@/utils/gameLogic';
import { getAIOptimalDirection, calculateMileageGain } from '@/utils/aiStrategy';

const GamePage = () => {
  const navigate = useNavigate();
  const {
    phase,
    currentPlayerId,
    diceValue,
    moveDirection,
    currentRound,
    totalRounds,
    players,
    isDiceRolling,
    showResult,
    skillEffects,
    turnOrder,
    currentTurnIndex,
    rollDiceForCurrentPlayer,
    setMoveDirection,
    setDiceRolling,
    executePlayerMove,
    settleRound,
    nextPlayer,
    nextRound,
    resetGame,
    clearSkillEffects,
  } = useGameStore();

  const [animationComplete, setAnimationComplete] = useState(false);
  const [movingPlayer, setMovingPlayer] = useState<string | null>(null);
  const [lastMileageGain, setLastMileageGain] = useState<number>(0);
  const [showSkillEffects, setShowSkillEffects] = useState(false);
  const [showStartAnimation, setShowStartAnimation] = useState(true);

  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // 起跑动画
  useEffect(() => {
    if (phase === 'playing' && showStartAnimation) {
      const timer = setTimeout(() => {
        setShowStartAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, showStartAnimation]);

  useEffect(() => {
    if (isDiceRolling && diceValue) {
      const timer = setTimeout(() => {
        setDiceRolling(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDiceRolling, diceValue]);

  useEffect(() => {
    if (phase === 'playing' && currentPlayer && currentPlayer.isAI && !diceValue && !isDiceRolling && !showResult && !moveDirection) {
      const timer = setTimeout(() => {
        rollDiceForCurrentPlayer();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, currentPlayer, diceValue, isDiceRolling, showResult, moveDirection]);

  useEffect(() => {
    if (phase === 'playing' && currentPlayer && currentPlayer.isAI && diceValue && !isDiceRolling && !moveDirection && !showResult) {
      const optimalDirection = getAIOptimalDirection(currentPlayer, diceValue);
      setMoveDirection(optimalDirection);
    }
  }, [phase, currentPlayer, diceValue, isDiceRolling, moveDirection, showResult]);

  useEffect(() => {
    if (!isDiceRolling && diceValue && moveDirection && !showResult && !animationComplete) {
      const timer = setTimeout(() => {
        setMovingPlayer(currentPlayerId);
        setLastMileageGain(calculateMileageGain(currentPlayer!, diceValue, moveDirection));
        executePlayerMove();
        setTimeout(() => {
          setMovingPlayer(null);
          setAnimationComplete(true);
        }, 400);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isDiceRolling, diceValue, moveDirection, showResult, animationComplete]);

  useEffect(() => {
    if (animationComplete && !showResult) {
      settleRound();
    }
  }, [animationComplete, showResult]);

  useEffect(() => {
    if (skillEffects.length > 0) {
      setShowSkillEffects(true);
      const timer = setTimeout(() => {
        setShowSkillEffects(false);
        setTimeout(() => clearSkillEffects(), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [skillEffects]);

  const handleContinue = () => {
    if (!currentPlayer) return;

    const isLastPlayer = currentTurnIndex === turnOrder.length - 1;

    if (isLastPlayer) {
      nextRound();
      if (phase === 'finished') {
        navigate('/result');
      }
    } else {
      nextPlayer();
    }

    setAnimationComplete(false);
    setLastMileageGain(0);
  };

  const getDiceIcon = () => {
    switch (diceValue) {
      case 1: return <Dice1 className="w-16 h-16" />;
      case 2: return <Dice2 className="w-16 h-16" />;
      case 3: return <Dice3 className="w-16 h-16" />;
      case 4: return <span className="text-6xl">🎲</span>;
      default: return <Dice1 className="w-16 h-16" />;
    }
  };

  const getRank = (playerId: string) => {
    const sorted = [...players].sort((a, b) => b.mileage - a.mileage);
    return sorted.findIndex(p => p.id === playerId) + 1;
  };

  if (phase === 'finished') {
    navigate('/result');
    return null;
  }

  const getEffectColor = (type: string) => {
    switch (type) {
      case 'buff': return 'from-green-500 to-emerald-600';
      case 'debuff': return 'from-red-500 to-rose-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getEffectIcon = (type: string) => {
    switch (type) {
      case 'buff': return '✨';
      case 'debuff': return '💀';
      default: return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2d5a27] via-[#3a702d] to-[#2d5a27] overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-sky-400 via-sky-300 to-green-500" />
        <div className="absolute top-8 right-12 w-20 h-20 bg-yellow-300 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.8)] animate-pulse" />
        <div className="absolute top-16 left-10 text-4xl opacity-80">☁️</div>
        <div className="absolute top-24 left-1/4 text-3xl opacity-60">☁️</div>
        <div className="absolute top-12 right-1/3 text-5xl opacity-70">☁️</div>
        <div className="absolute top-1/4 left-0 right-0 h-24 bg-gradient-to-b from-green-700/50 to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(255,255,255,0.02) 0%, transparent 50%)
          `
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-900/80 to-transparent">
          <div className="flex justify-around items-end h-full pb-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-2 h-12 bg-amber-800 rounded-t" />
            ))}
          </div>
        </div>
      </div>

      {/* 起跑动画 */}
      <AnimatePresence>
        {showStartAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-8"
              >
                <div className="text-8xl mb-4">🏇</div>
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 drop-shadow-lg">
                  起跑抽签结果
                </div>
              </motion.div>

              <div className="flex flex-col gap-4 items-center">
                {turnOrder.map((playerId, index) => {
                  const player = players.find(p => p.id === playerId);
                  if (!player) return null;

                  const messages = ['完美的起跑！', '顺利的起跑！', '有点小失误！', '出闸失误了！'];
                  const colors = ['from-green-400 to-emerald-500', 'from-blue-400 to-cyan-500', 'from-yellow-400 to-orange-500', 'from-red-400 to-rose-500'];

                  return (
                    <motion.div
                      key={playerId}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.3 }}
                      className={`flex items-center gap-4 px-6 py-3 rounded-2xl bg-gradient-to-r ${colors[index]} shadow-xl`}
                    >
                      <div className="text-3xl font-black text-white/90">{index + 1}</div>
                      <div
                        className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.character.avatar}
                      </div>
                      <div className="text-white">
                        <div className="font-bold">{player.character.name}</div>
                        <div className="text-sm text-white/80">{messages[index]}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部信息 */}
      <div className="relative z-10 flex justify-between items-center px-4 md:px-8 pt-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-800/90 to-amber-900/90 px-4 py-2 rounded-full border-2 border-amber-600 shadow-lg">
          <span className="text-yellow-300 text-sm">🏇 赛马风云</span>
          <span className="text-white font-bold">第 {currentRound} / {totalRounds} 回合</span>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-green-700/90 to-green-800/90 px-4 py-2 rounded-full border-2 border-green-500 shadow-lg">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-bold text-sm">
            {currentPlayer?.character.avatar} {currentPlayer?.name}
            {currentPlayer?.isAI && ' (AI)'}
          </span>
        </div>
      </div>

      {/* 出手顺序 */}
      <div className="relative z-10 flex justify-center gap-2 mt-2 px-4">
        {turnOrder.map((playerId, index) => {
          const player = players.find(p => p.id === playerId);
          return (
            <motion.div
              key={playerId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: playerId === currentPlayerId ? 1 : 0.5, scale: playerId === currentPlayerId ? 1.1 : 1 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                playerId === currentPlayerId
                  ? 'bg-yellow-500 text-black'
                  : 'bg-black/50 text-white/70'
              }`}
            >
              <span>{index + 1}</span>
              <span>{player?.character.avatar}</span>
            </motion.div>
          );
        })}
      </div>

      {/* 赛道区域 */}
      <div className="relative z-10 px-2 md:px-4 mt-4">
        <div className="relative">
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="text-2xl">🏃</div>
            <span className="text-xs text-white font-bold bg-green-600 px-2 py-1 rounded">排头</span>
          </div>

          <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="text-2xl">🐢</div>
            <span className="text-xs text-white font-bold bg-red-600 px-2 py-1 rounded">排尾</span>
          </div>

          <div className="relative bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 rounded-full p-2 md:p-4 border-4 border-amber-800 shadow-[0_10px_60px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-4 bg-gradient-to-b from-green-500/20 to-green-600/30 rounded-full" />
            
            <div className="flex gap-1 md:gap-2 relative z-10">
              {Array.from({ length: TRACK_CONFIG.totalCells }, (_, i) => {
                const label = TRACK_CONFIG.cellLabels[i];
                const playersInCell = players.filter(p => p.position === i);
                const styleConfig = getRunningStyleConfig(label);

                return (
                  <motion.div
                    key={i}
                    className="flex-1 aspect-square relative flex flex-col items-center justify-center rounded-lg border-2 overflow-hidden"
                    style={{
                      backgroundColor: `${styleConfig.color}30`,
                      borderColor: `${styleConfig.color}80`,
                    }}
                  >
                    <span className="absolute top-1 left-1 text-[10px] md:text-xs font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                      {label}
                    </span>
                    <span className="absolute top-1 right-1 text-[10px] text-white/70 bg-black/30 px-1 rounded">
                      {i + 1}
                    </span>

                    <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                      {playersInCell.map((player, idx) => (
                        <motion.div
                          key={player.id}
                          initial={movingPlayer === player.id ? { y: -15, scale: 1.4 } : { y: 0, scale: 1 }}
                          animate={{ y: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="relative"
                        >
                          <div
                            className="relative group w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg md:text-xl cursor-pointer"
                            style={{
                              backgroundColor: player.color,
                              boxShadow: `0 0 15px ${player.color}80`,
                            }}
                          >
                            {player.character.avatar}
                            
                            {/* 技能提示 */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                              <div className="bg-gray-900/95 border-2 border-amber-500 rounded-xl p-3 shadow-xl">
                                <div className="text-amber-400 font-bold text-sm mb-1">{player.character.name}</div>
                                <div className="text-yellow-300 text-xs font-bold mb-2">⚡ {player.character.skill.name}</div>
                                <div className="text-gray-300 text-xs leading-relaxed max-w-xs">{player.character.skill.description}</div>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-amber-500" />
                            </div>
                          </div>
                          <div
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-black text-white border border-yellow-300"
                          >
                            {getRank(player.id)}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-xs md:text-sm opacity-50">
                      {label === '逃' && '⚡'}
                      {label === '先' && '🏆'}
                      {label === '差' && '🎯'}
                      {label === '追' && '💨'}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-between px-8 mt-3">
              <div className="flex items-center gap-2 text-amber-900/70 text-sm">
                <ChevronLeft className="w-5 h-5" />
                <span>左方向</span>
              </div>
              <div className="flex items-center gap-2 text-amber-900/70 text-sm">
                <span>右方向</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 - 玩家信息 + 排名表 */}
      <div className="relative z-10 flex justify-center items-start gap-6 mt-6 px-4">
        {/* 玩家信息 - 按出手顺序排列 */}
        <div className="flex flex-col gap-3">
          <div className="text-amber-300 text-sm font-bold text-center mb-1">📋 出手顺序</div>
          <div className="flex gap-3">
            {turnOrder.map((playerId, turnIdx) => {
              const player = players.find(p => p.id === playerId);
              if (!player) return null;
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: turnIdx * 0.1 }}
                  className={`relative flex flex-col items-center gap-2 bg-gradient-to-b from-amber-900/80 to-amber-950/80 px-4 py-3 rounded-2xl border-2 backdrop-blur-sm ${
                    player.id === currentPlayerId ? 'border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-amber-700/50'
                  }`}
                >
                  <div className="text-amber-400 text-xs font-bold">第{turnIdx + 1}位</div>
                  
                  <div
                    className="relative group w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center text-2xl cursor-pointer"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.character.avatar}
                    
                    {/* 技能提示 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                      <div className="bg-gray-900/95 border-2 border-amber-500 rounded-xl p-3 shadow-xl">
                        <div className="text-amber-400 font-bold text-sm mb-1">{player.character.name}</div>
                        <div className="text-yellow-300 text-xs font-bold mb-2">⚡ {player.character.skill.name}</div>
                        <div className="text-gray-300 text-xs leading-relaxed max-w-xs">{player.character.skill.description}</div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-amber-500" />
                    </div>
                  </div>

                  <div className="text-white text-center">
                    <div className="text-xs font-bold">{player.character.name}</div>
                    <div className="text-xs text-amber-300">{player.mileage} 里程</div>
                  </div>

                  {player.id === currentPlayerId && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 排名表 - 按里程排序 */}
        <div className="flex flex-col items-center">
          <div className="text-amber-300 text-sm font-bold mb-2">🏆 排名</div>
          <div className="bg-gradient-to-b from-amber-900/60 to-amber-950/80 rounded-2xl border-2 border-amber-700/50 p-3 backdrop-blur-sm">
            {[...players].sort((a, b) => b.mileage - a.mileage).map((player, rankIdx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rankIdx * 0.05 }}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg mb-1 ${
                  rankIdx === 0 ? 'bg-yellow-500/20' : rankIdx === 1 ? 'bg-gray-400/20' : rankIdx === 2 ? 'bg-amber-600/20' : ''
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                  rankIdx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  rankIdx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                  rankIdx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                  'bg-black/50 text-white'
                }`}>
                  {rankIdx + 1}
                </div>
                <div
                  className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-sm"
                  style={{ backgroundColor: player.color }}
                >
                  {player.character.avatar}
                </div>
                <span className="text-white text-xs font-medium">{player.character.name}</span>
                <span className="text-amber-300 text-xs ml-auto">{player.mileage}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 技能效果弹出提示 */}
      <AnimatePresence>
        {showSkillEffects && skillEffects.map((effect, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.2 }}
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-2xl bg-gradient-to-r ${getEffectColor(effect.type)} shadow-2xl border-2 border-white/30`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEffectIcon(effect.type)}</span>
              <div>
                <div className="text-white font-bold text-lg">{effect.skillName}</div>
                <div className="text-white/90 text-sm">{effect.playerName}: {effect.effect}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 操作区域 */}
      <div className="relative z-10 px-4 md:px-8 mt-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!currentPlayer?.isAI && !diceValue && !isDiceRolling && !showResult && (
            <motion.button
              key="roll"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={rollDiceForCurrentPlayer}
              className="relative px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-full font-black text-xl shadow-[0_8px_30px_rgba(251,191,36,0.5)] border-4 border-yellow-300 flex items-center gap-3"
            >
              <span className="text-2xl">🎲</span>
              投掷骰子
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
            </motion.button>
          )}

          {diceValue && !isDiceRolling && !showResult && (
            <motion.div
              key="direction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-28 h-28 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-2xl border-4 border-amber-600 flex items-center justify-center"
                style={{ boxShadow: '0 10px 40px rgba(120, 80, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.5)' }}
              >
                <div className="text-yellow-600">
                  {getDiceIcon()}
                </div>
              </motion.div>

              <p className="text-2xl font-black text-yellow-300 drop-shadow-lg">
                投出了 <span className="text-4xl">{diceValue}</span> 点！
              </p>

              {!currentPlayer?.isAI && (
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMoveDirection('left')}
                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg border-2 border-blue-400"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronLeft className="w-6 h-6" />
                      向左移动
                    </span>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded">
                      +{calculateMileageGain(currentPlayer!, diceValue, 'left')} 里程
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMoveDirection('right')}
                    className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg border-2 border-green-400"
                  >
                    <span className="flex items-center gap-2">
                      向右移动
                      <ChevronRight className="w-6 h-6" />
                    </span>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded">
                      +{calculateMileageGain(currentPlayer!, diceValue, 'right')} 里程
                    </div>
                  </motion.button>
                </div>
              )}

              {currentPlayer?.isAI && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-amber-200"
                >
                  <span className="text-2xl animate-bounce">🤖</span>
                  <span className="font-bold">AI正在选择最优方向...</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl"
              >
                🎉
              </motion.div>
              <p className="text-xl text-white font-bold">
                移动到位置 <span className="text-yellow-400 text-3xl">{currentPlayer?.position + 1}</span>
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 px-8 py-4 rounded-full border-2 border-green-400"
              >
                <span className="text-green-300 text-lg">获得里程</span>
                <span className="text-4xl font-black text-green-400 ml-2">+{lastMileageGain}</span>
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="mt-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-bold text-lg shadow-lg border-2 border-yellow-300 flex items-center gap-2"
              >
                继续
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            resetGame();
            navigate('/');
          }}
          className="mt-6 flex items-center gap-2 text-amber-200/60 hover:text-amber-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">重新开始</span>
        </motion.button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-800/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default GamePage;