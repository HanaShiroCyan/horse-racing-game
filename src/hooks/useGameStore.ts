import { create } from 'zustand';
import { GameState, Player, GameConfig, MoveResult, Character, PlayerSkillState, SkillEffect } from '@/types';
import { getRunningStyleConfig, PLAYER_COLORS } from '@/config/runningStyles';
import { CHARACTERS, getRandomCharacter } from '@/config/characters';
import { rollDice, executeMove, calculateMileage, isGameFinished, MoveDirection } from '@/utils/gameLogic';

interface GameStore extends GameState {
  initGame: (config: GameConfig, selectedCharacter: Character, initialPosition: number) => void;

  rollDiceForCurrentPlayer: () => void;

  setMoveDirection: (direction: MoveDirection) => void;

  executePlayerMove: () => void;

  settleRound: () => void;

  nextPlayer: () => void;

  nextRound: () => void;

  resetGame: () => void;

  setDiceRolling: (rolling: boolean) => void;

  setShowResult: (show: boolean) => void;

  setPlayerInitialPosition: (playerId: string, position: number) => void;

  clearSkillEffects: () => void;

  addSkillEffect: (effect: SkillEffect) => void;

  useActiveSkill: (playerId: string) => void;

  triggerRoundStartSkills: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createSkillState = (character: Character): PlayerSkillState => {
  return {
    skillId: character.skill.id,
    usesRemaining: character.skill.maxUses || 0,
    cooldown: character.skill.cooldown || 0,
    isActive: false,
    extraData: {
      consecutiveBonusRounds: 0,
      burningBloodFailures: 0,
      outsideZoneCount: 0,
      skillActiveTurns: 0,
      lastZoneBonusRound: 0,
    },
  };
};

const createPlayer = (character: Character, isAI: boolean, index: number, initialPosition: number): Player => {
  return {
    id: generateId(),
    name: isAI ? `AI-${character.name}` : character.name,
    character,
    runningStyle: character.runningStyle,
    position: initialPosition,
    initialPosition: initialPosition,
    mileage: 0,
    isAI,
    color: character.color,
    skillState: createSkillState(character),
    history: [],
  };
};

const determineTurnOrder = (players: Player[]): string[] => {
  const goldShip = players.find(p => p.character.id === 'gold_ship');
  const otherPlayers = players.filter(p => p.character.id !== 'gold_ship');

  const shuffledOthers = otherPlayers.map(p => ({
    ...p,
    random: Math.random(),
  })).sort((a, b) => b.random - a.random);

  const order = shuffledOthers.map(p => p.id);
  
  if (goldShip) {
    order.push(goldShip.id);
  }

  return order;
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'setup',
  currentPlayerId: null,
  diceValue: null,
  moveDirection: null,
  currentRound: 0,
  totalRounds: 10,
  players: [],
  isDiceRolling: false,
  showResult: false,
  skillEffects: [],
  turnOrder: [],
  currentTurnIndex: 0,

  initGame: (config: GameConfig, selectedCharacter: Character, initialPosition: number) => {
    const humanPlayer = createPlayer(selectedCharacter, false, 0, initialPosition);

    const usedCharacterIds = new Set([selectedCharacter.id]);
    const aiPlayers: Player[] = [];
    
    for (let i = 0; i < 3; i++) {
      const availableChars = CHARACTERS.filter(c => !usedCharacterIds.has(c.id));
      if (availableChars.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      const randomChar = availableChars[randomIndex];
      usedCharacterIds.add(randomChar.id);
      
      const styleConfig = getRunningStyleConfig(randomChar.runningStyle);
      const aiPos = styleConfig.zonePositions[Math.floor(Math.random() * styleConfig.zonePositions.length)];
      aiPlayers.push(createPlayer(randomChar, true, i + 1, aiPos));
    }

    const players = [humanPlayer, ...aiPlayers];
    const turnOrder = determineTurnOrder(players);

    set({
      phase: 'playing',
      currentPlayerId: turnOrder[0],
      diceValue: null,
      moveDirection: null,
      currentRound: 1,
      totalRounds: config.totalRounds,
      players,
      showResult: false,
      skillEffects: [],
      turnOrder,
      currentTurnIndex: 0,
    });
  },

  rollDiceForCurrentPlayer: () => {
    const state = get();
    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
    if (!currentPlayer) return;

    let diceValue: number;
    if (currentPlayer.character.id === 'narita_taishin') {
      diceValue = Math.floor(Math.random() * 4) + 1;
    } else {
      diceValue = rollDice();
    }

    set({ diceValue, isDiceRolling: true, moveDirection: null });
  },

  setMoveDirection: (direction: MoveDirection) => {
    set({ moveDirection: direction });
  },

  executePlayerMove: () => {
    const state = get();
    if (!state.currentPlayerId || state.diceValue === null) return;

    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
    if (!currentPlayer) return;

    const direction = state.moveDirection || 'right';
    const moveResult = executeMove(currentPlayer, state.diceValue, direction, state.currentRound, state.players);

    const updatedPlayers = state.players.map(p => {
      if (p.id === state.currentPlayerId) {
        const newPlayer = {
          ...p,
          position: moveResult.endPosition,
          mileage: p.mileage + moveResult.mileageGain,
          skillState: { ...p.skillState, extraData: { ...p.skillState.extraData } },
        };

        // 双涡轮投出1点，本回合立即失去效果
        if (currentPlayer.character.id === 'double_turbo' && state.diceValue === 1) {
          newPlayer.skillState.extraData.doubleTurboRolledOne = true;
          moveResult.skillEffects.push({
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            skillName: currentPlayer.character.skill.name,
            effect: '投出1点！反向爆冲效果失效！',
            type: 'debuff',
          });
        }

        newPlayer.history.push({
          roundNumber: state.currentRound,
          diceValue: state.diceValue,
          startPosition: currentPlayer.position,
          endPosition: moveResult.endPosition,
          wasInZone: moveResult.isInBonusZone,
          mileageGain: moveResult.mileageGain,
        });

        return newPlayer;
      }
      return p;
    });

    set({
      players: updatedPlayers,
      isDiceRolling: false,
      skillEffects: [...state.skillEffects, ...moveResult.skillEffects],
    });
  },

  settleRound: () => {
    const state = get();
    set({ showResult: true });
  },

  nextPlayer: () => {
    const state = get();
    if (!state.currentPlayerId) return;

    const nextTurnIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
    const nextPlayerId = state.turnOrder[nextTurnIndex];

    const updatedPlayers = state.players.map(p => {
      const newSkillState = { ...p.skillState };

      if (newSkillState.cooldown > 0) {
        newSkillState.cooldown--;
      }

      if (p.character.id === 'agnes_tachyon') {
        const wasInZone = p.history.length > 0 && p.history[p.history.length - 1].wasInZone;
        if (!wasInZone) {
          newSkillState.extraData.outsideZoneCount = (newSkillState.extraData.outsideZoneCount || 0) + 1;
        }
      }

      return { ...p, skillState: newSkillState };
    });

    set({
      currentPlayerId: nextPlayerId,
      currentTurnIndex: nextTurnIndex,
      diceValue: null,
      moveDirection: null,
      showResult: false,
      players: updatedPlayers,
      skillEffects: [],
    });
  },

  nextRound: () => {
    const state = get();
    const newRound = state.currentRound + 1;

    if (isGameFinished(newRound, state.totalRounds)) {
      set({
        phase: 'finished',
        currentRound: newRound,
      });
    } else {
      const updatedPlayers = state.players.map(p => {
        const newSkillState = { ...p.skillState };

        if (newSkillState.cooldown > 0) {
          newSkillState.cooldown--;
        }

        return { ...p, skillState: newSkillState };
      });

      // 出手顺序只在游戏开始时确定一次，之后不再改变
      set({
        currentRound: newRound,
        currentPlayerId: state.turnOrder[0],
        currentTurnIndex: 0,
        diceValue: null,
        moveDirection: null,
        showResult: false,
        players: updatedPlayers,
        skillEffects: [],
      });
    }
  },

  resetGame: () => {
    set({
      phase: 'setup',
      currentPlayerId: null,
      diceValue: null,
      moveDirection: null,
      currentRound: 0,
      totalRounds: 10,
      players: [],
      isDiceRolling: false,
      showResult: false,
      skillEffects: [],
      turnOrder: [],
      currentTurnIndex: 0,
    });
  },

  setDiceRolling: (rolling: boolean) => {
    set({ isDiceRolling: rolling });
  },

  setShowResult: (show: boolean) => {
    set({ showResult: show });
  },

  setPlayerInitialPosition: (playerId: string, position: number) => {
    const state = get();
    const updatedPlayers = state.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          position,
          initialPosition: position,
        };
      }
      return p;
    });
    set({ players: updatedPlayers });
  },

  clearSkillEffects: () => {
    set({ skillEffects: [] });
  },

  addSkillEffect: (effect: SkillEffect) => {
    set(state => ({
      skillEffects: [...state.skillEffects, effect],
    }));
  },

  useActiveSkill: (playerId: string) => {
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.character.skill.isActive) return;

    const skillState = player.skillState;
    if (skillState.usesRemaining <= 0 || skillState.cooldown > 0) return;

    const updatedPlayers = state.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          skillState: {
            ...p.skillState,
            usesRemaining: p.skillState.usesRemaining - 1,
            cooldown: p.character.skill.cooldown || 0,
            isActive: true,
          },
        };
      }
      return p;
    });

    set({ players: updatedPlayers });
  },

  triggerRoundStartSkills: () => {
    const state = get();
    const effects: SkillEffect[] = [];

    const updatedPlayers = state.players.map(player => {
      if (!player.isAI && player.character.skill.isActive && player.character.skill.triggerType === 'round_start') {
        if (player.character.id === 'golden_age') {
          if (player.skillState.usesRemaining > 0) {
            effects.push({
              playerId: player.id,
              playerName: player.name,
              skillName: player.character.skill.name,
              effect: '回合开始，是否使用技能？',
              type: 'neutral',
            });
          }
        }
      }

      return player;
    });

    if (effects.length > 0) {
      set(state => ({
        skillEffects: [...state.skillEffects, ...effects],
      }));
    }
  },
}));