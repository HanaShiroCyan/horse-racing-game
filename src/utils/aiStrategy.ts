import { Player } from '@/types';
import { calculateMove, calculateMileage, MoveDirection } from './gameLogic';

export const getAIOptimalDirection = (player: Player, diceValue: number): MoveDirection => {
  const leftMove = calculateMove(player.position, diceValue, 'left');
  const leftPlayer = { ...player, position: leftMove.newPosition };
  const leftMileage = calculateMileage(leftPlayer, 1, []).mileage;

  const rightMove = calculateMove(player.position, diceValue, 'right');
  const rightPlayer = { ...player, position: rightMove.newPosition };
  const rightMileage = calculateMileage(rightPlayer, 1, []).mileage;

  if (leftMileage > rightMileage) {
    return 'left';
  } else if (rightMileage > leftMileage) {
    return 'right';
  } else {
    return Math.random() > 0.5 ? 'left' : 'right';
  }
};

export const calculateMileageGain = (player: Player, diceValue: number, direction: MoveDirection): number => {
  const move = calculateMove(player.position, diceValue, direction);
  const tempPlayer = { ...player, position: move.newPosition };
  return calculateMileage(tempPlayer, 1, []).mileage;
};