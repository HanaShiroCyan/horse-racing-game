import { Player } from '@/types';
import { calculateMove, calculateMileage, MoveDirection } from './gameLogic';

/** 创建用于预览计算的玩家深拷贝，避免 calculateMileage 的副作用污染原始数据 */
function cloneForPreview(player: Player, newPosition: number): Player {
  return {
    ...player,
    position: newPosition,
    skillState: {
      ...player.skillState,
      extraData: JSON.parse(JSON.stringify(player.skillState.extraData)),
    },
  };
}

export const getAIOptimalDirection = (player: Player, diceValue: number, allPlayers: Player[] = [], currentRound: number = 1): MoveDirection => {
  const leftMove = calculateMove(player.position, diceValue, 'left');
  const leftPlayer = cloneForPreview(player, leftMove.newPosition);
  const leftMileage = calculateMileage(leftPlayer, currentRound, allPlayers, true, diceValue).mileage;

  const rightMove = calculateMove(player.position, diceValue, 'right');
  const rightPlayer = cloneForPreview(player, rightMove.newPosition);
  const rightMileage = calculateMileage(rightPlayer, currentRound, allPlayers, true, diceValue).mileage;

  if (leftMileage > rightMileage) {
    return 'left';
  } else if (rightMileage > leftMileage) {
    return 'right';
  } else {
    return Math.random() > 0.5 ? 'left' : 'right';
  }
};

export const calculateMileageGain = (player: Player, diceValue: number, direction: MoveDirection, allPlayers: Player[] = [], currentRound: number = 1): number => {
  const move = calculateMove(player.position, diceValue, direction);
  const tempPlayer = cloneForPreview(player, move.newPosition);
  return calculateMileage(tempPlayer, currentRound, allPlayers, true, diceValue).mileage;
};