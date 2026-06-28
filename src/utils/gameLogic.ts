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

export const calculateMileage = (player: Player, currentRound: number, players: Player[], isPreview: boolean = false, diceValue?: number): { mileage: number; effects: SkillEffect[] } => {
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

  if (player.character.id === 'silence_suzuka') {
    if (currentRound % 3 === 0 && !isPreview && Math.random() < 0.75) {
      baseMileage += 35;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '天马之歌触发！额外+35里程',
        type: 'buff',
      });
    }
  }

  if (player.character.id === 'eagle') {
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

  if (player.character.id === 'tokai_teio') {
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

  if (player.character.id === 'oguri_cap') {
    const chains = player.skillState.extraData.divineBonusChains || [];

    // 检测是否从非对应区域回到对应区域 → 触发新链 [30, 20, 10]
    if (player.history.length > 0) {
      const lastHistory = player.history[player.history.length - 1];
      if (!lastHistory.wasInZone && isInZone) {
        chains.push([30, 20, 10]);
        effects.push({
          playerId: player.id,
          playerName: player.name,
          skillName: player.character.skill.name,
          effect: '神临触发！回到对应区域，本回合+30（可叠加）',
          type: 'buff',
        });
      }
    }

    // 汇总所有活跃链的当前回合加成
    let totalDivineBonus = 0;
    for (let i = chains.length - 1; i >= 0; i--) {
      const chain = chains[i];
      if (chain.length > 0) {
        totalDivineBonus += chain[0];
        chain.shift(); // 消耗本回合加成
      }
      if (chain.length === 0) {
        chains.splice(i, 1); // 空链移除
      }
    }

    if (totalDivineBonus > 0) {
      baseMileage += totalDivineBonus;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: `神临！额外+${totalDivineBonus}里程`,
        type: 'buff',
      });
    }

    player.skillState.extraData.divineBonusChains = chains;
  }

  if (player.character.id === 'agnes_tachyon') {
    const outsideCount = player.skillState.extraData.outsideZoneCount || 0;
    if (isInZone || outsideCount <= 1) {
      baseMileage += 20;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: isInZone
          ? '在对应区域，玻璃腿BUFF！额外+20里程'
          : `玻璃腿BUFF！额外+20里程（剩余能量${Math.max(0, 2 - outsideCount)}格）`,
        type: 'buff',
      });
    } else {
      baseMileage -= 10;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '能量耗尽！玻璃腿DEBUFF！额外-10里程',
        type: 'debuff',
      });
    }
  }

  if (player.character.id === 'great_impact') {
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
    console.group('🐎 黄金船技能判定');
    console.log('对手们的位置:');
    players.forEach(p => {
      if (p.id === player.id) {
        console.log(`  [黄金船本人] ${p.character.name} 位置=${p.position} 跑法=${p.runningStyle}`);
      } else {
        const cfg = getRunningStyleConfig(p.runningStyle);
        const inZone = cfg.zonePositions.includes(p.position);
        console.log(`  ${p.character.name} 位置=${p.position} 跑法=${p.runningStyle} 对应区域=[${cfg.zonePositions}] ${inZone ? '✅在区域内' : '❌不在区域'}`);
      }
    });

    const allOthersInZone = players.every(p => {
      if (p.id === player.id) return true;
      const styleConfig = getRunningStyleConfig(p.runningStyle);
      return styleConfig.zonePositions.includes(p.position);
    });

    console.log(`判定结果: ${allOthersInZone ? '✅ 全部对手在区域 → +120' : '❌ 有对手不在区域 → -20'}`);
    console.log(`基础分: ${isInZone ? runningStyleConfig.bonusMileage : 100}`);
    console.groupEnd();

    if (allOthersInZone) {
      baseMileage += 120;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '原来我在比赛啊！所有对手在对应区域，额外+120里程',
        type: 'buff',
      });
    } else {
      baseMileage -= 20;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '原来我在比赛啊！有对手不在对应区域，额外-20里程',
        type: 'debuff',
      });
    }
  }

  if (player.character.id === 'narita_taishin') {
    if (diceValue === 4) {
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

  if (player.character.id === 'vodka') {
    if (player.skillState.isActive) {
      baseMileage += 35;
      effects.push({
        playerId: player.id,
        playerName: player.name,
        skillName: player.character.skill.name,
        effect: '燃血激活！额外+35里程',
        type: 'buff',
      });

      // 预览时跳过随机判定（不剧透），实际游戏才判定
      if (!isPreview && player.skillState.isActive && Math.random() >= 0.6) {
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
  const { mileage, effects } = calculateMileage(updatedPlayer, currentRound, allPlayers, false, diceValue);
  
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

export const calculateMileageGain = (player: Player, diceValue: number, direction: MoveDirection, allPlayers: Player[] = [], currentRound: number = 1): number => {
  const move = calculateMove(player.position, diceValue, direction);
  const tempPlayer = {
    ...player,
    position: move.newPosition,
    skillState: {
      ...player.skillState,
      extraData: JSON.parse(JSON.stringify(player.skillState.extraData)),
    },
  };
  return calculateMileage(tempPlayer, currentRound, allPlayers, true, diceValue).mileage;
};