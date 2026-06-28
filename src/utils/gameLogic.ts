import { Player, MoveResult, SkillEffect } from '@/types';
import { getRunningStyleConfig, TRACK_CONFIG } from '@/config/runningStyles';

export type MoveDirection = 'left' | 'right';

export const calculateMove = (
  currentPosition: number,
  diceValue: number,
  direction: MoveDirection = 'right'
): { newPosition: number; path: number[] } => {
  const trackLength = TRACK_CONFIG.totalCells;
  const path: number[] = [];
  let stepsRemaining = diceValue;
  let currentPos = currentPosition;
  let dir = direction === 'right' ? 1 : -1;

  path.push(currentPos);

  while (stepsRemaining > 0) {
    let nextPos = currentPos + dir;

    if (nextPos >= trackLength || nextPos < 0) {
      dir = -dir;
      nextPos = currentPos + dir;
    }

    currentPos = nextPos;
    path.push(currentPos);
    stepsRemaining--;
  }

  return {
    newPosition: currentPos,
    path,
  };
};

export const calculateMileage = (player: Player, currentRound: number, players: Player[]): { mileage: number; effects: SkillEffect[] } => {
  const runningStyleConfig = getRunningStyleConfig(player.runningStyle);
  const isInZone = runningStyleConfig.zonePositions.includes(player.position);

  let baseMileage = isInZone ? runningStyleConfig.bonusMileage : 100;
  const effects: SkillEffect[] = [];

  if (player.character.id === 'double_turbo') {
    // 检查是否本回合投出了1点（本回合立即失效）
    const rolledOneThisRound = player.history.length > 0 && 
      player.history[player.history.length - 1].diceValue === 1;
    const previouslyRolledOne = player.skillState.extraData.doubleTurboRolledOne;
    
    if (!rolledOneThisRound && !previouslyRolledOne && isInZone) {
      baseMileage = 150;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '里程奖励从120提升至150！',
        type: 'buff',
      });
    }
  }

  if (player.character.id === 'pegasus_song') {
    if (currentRound % 3 === 0 && Math.random() < 0.35) {
      baseMileage += 30;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '完美脚步！额外+30里程',
        type: 'buff',
      });
    }
  }

  if (player.character.id === 'touch_world') {
    if (player.history.length > 0) {
      const lastHistory = player.history[player.history.length - 1];
      if (lastHistory.wasInZone) {
        baseMileage += 10;
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: '上回合在区域内，额外+10里程',
          type: 'buff',
        });

        if (isInZone) {
          baseMileage += 10;
          effects.push({
            playerId: player.id,
            playerName: player.name,
            skillName: player.character.skill.name,
            effect: '本回合仍在区域内，再额外+10里程',
            type: 'buff',
          });
        }
      }
    }
  }

  if (player.character.id === 'ultimate_dance') {
    if (currentRound >= 3 && player.history.length >= 2) {
      const lastTwoHistory = player.history.slice(-2);
      const sum = lastTwoHistory[0].diceValue + lastTwoHistory[1].diceValue;
      if ([4, 5, 6].includes(sum)) {
        const bonus = sum * 5;
        baseMileage += bonus;
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: `前两回合点数和${sum}，额外+${bonus}里程`,
          type: 'buff',
        });
      }
    }
  }

  if (player.character.id === 'divine_presence') {
    if (player.history.length > 0) {
      const lastHistory = player.history[player.history.length - 1];
      const lastRoundNum = player.history.length > 1 ? player.history[player.history.length - 2].roundNumber : 0;
      
      if (!lastHistory.wasInZone && isInZone) {
        const bonusThisRound = 30;
        const bonusNextRound = 20;
        const bonusAfterNext = 10;
        
        baseMileage += bonusThisRound;
        player.skillState.extraData.consecutiveBonusRounds = 2;
        
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: `神临！本回合+${bonusThisRound}，下回合+${bonusNextRound}，再下回合+${bonusAfterNext}`,
          type: 'buff',
        });
      } else if (player.skillState.extraData.consecutiveBonusRounds > 0) {
        if (player.skillState.extraData.consecutiveBonusRounds === 2) {
          baseMileage += 20;
          effects.push({
            playerId: player.id,
            playerName: player.name,
            skillName: player.character.skill.name,
            effect: '神临效果延续！额外+20里程',
            type: 'buff',
          });
        } else {
          baseMileage += 10;
          effects.push({
            playerId: player.id,
            playerName: player.name,
            skillName: player.character.skill.name,
            effect: '神临效果最后回合！额外+10里程',
            type: 'buff',
          });
        }
        player.skillState.extraData.consecutiveBonusRounds--;
      }
    }
  }

  if (player.character.id === 'glass_leg') {
    const outsideCount = player.skillState.extraData.outsideZoneCount || 0;
    if (outsideCount <= 3) {
      baseMileage += 20;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '玻璃腿BUFF！额外+20里程',
        type: 'buff',
      });
    } else {
      baseMileage -= 10;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '玻璃腿DEBUFF！额外-10里程',
        type: 'debuff',
      });
    }
  }

  if (player.character.id === 'hero') {
    if (currentRound >= 2) {
      const hasOtherInZone = players.some(p => 
        p.id !== player.id && 
        p.history.length > 0 && 
        p.history[p.history.length - 1].wasInZone
      );
      if (hasOtherInZone) {
        baseMileage += 20;
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: '英雄！其他马在区域内，额外+20里程',
          type: 'buff',
        });
      }
    }
  }

  if (player.character.id === 'gold_ship') {
    const allOthersInZone = players.every(p => 
      p.id !== player.id && 
      p.history.length > 0 && 
      p.history[p.history.length - 1].wasInZone
    );
    
    if (allOthersInZone) {
      baseMileage += 120;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '原来我在比赛啊！所有对手在区域内，额外+120里程',
        type: 'buff',
      });
    } else {
      baseMileage -= 20;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '原来我在比赛啊！对手不在区域内，额外-20里程',
        type: 'debuff',
      });
    }
  }

  if (player.character.id === 'coward') {
    const lastHistory = player.history[player.history.length - 1];
    if (lastHistory && lastHistory.diceValue === 4) {
      baseMileage += 30;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '投出4点！额外+30里程',
        type: 'buff',
      });
    }
  }

  if (player.character.id === 'burning_blood') {
    if (player.skillState.isActive) {
      baseMileage += 35;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '燃血！额外+35里程',
        type: 'buff',
      });

      if (Math.random() >= 0.6) {
        const outsideTurns = player.history.filter(h => !h.wasInZone).length;
        const penalty = outsideTurns * 10;
        baseMileage -= penalty;
        player.skillState.isActive = false;
        
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: `燃血判定失败！技能关闭，扣除${penalty}里程`,
          type: 'debuff',
        });
      }
    }
  }

  return { mileage: baseMileage, effects };
};

export const executeMove = (player: Player, diceValue: number, direction: MoveDirection = 'right', currentRound: number = 1, allPlayers: Player[] = []): MoveResult => {
  const startPosition = player.position;
  const { newPosition, path } = calculateMove(startPosition, diceValue, direction);

  const updatedPlayer = { ...player, position: newPosition };
  const { mileage, effects } = calculateMileage(updatedPlayer, currentRound, allPlayers);
  
  const runningStyleConfig = getRunningStyleConfig(player.runningStyle);
  const isInBonusZone = runningStyleConfig.zonePositions.includes(newPosition);

  return {
    playerId: player.id,
    startPosition,
    endPosition: newPosition,
    diceValue,
    mileageGain: mileage,
    isInBonusZone,
    path,
    skillEffects: effects,
  };
};

export const rollDice = (): number => {
  return Math.floor(Math.random() * 3) + 1;
};

export const isGameFinished = (currentRound: number, totalRounds: number): boolean => {
  return currentRound >= totalRounds;
};

export const getRanking = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => b.mileage - a.mileage);
};

export const calculateMileageGain = (player: Player, diceValue: number, direction: MoveDirection): number => {
  const move = calculateMove(player.position, diceValue, direction);
  const tempPlayer = { ...player, position: move.newPosition };
  return calculateMileage(tempPlayer, 1, []).mileage;
};