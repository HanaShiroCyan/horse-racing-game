import { RunningStyleConfig } from '@/types';

// 四种跑法的配置
export const RUNNING_STYLES: Record<string, RunningStyleConfig> = {
  '逃': {
    type: '逃',
    name: '逃马',
    description: '喜欢领跑的马，起跑后迅速占据前方位置',
    zonePositions: [0, 1, 2], // 赛道最前方的三个格子
    bonusMileage: 120,
    color: '#F4A460', // 金黄色
    icon: 'run',
  },
  '先': {
    type: '先',
    name: '先马',
    description: '善于跟随的马，保持在前方集团但避免领跑',
    zonePositions: [3, 4, 5], // 赛道中前方的三个格子
    bonusMileage: 150,
    color: '#8B4513', // 深棕色
    icon: 'walk',
  },
  '差': {
    type: '差',
    name: '差马',
    description: '后发制人的马，前期保存体力后期冲刺',
    zonePositions: [6, 7, 8], // 赛道中后方的三个格子
    bonusMileage: 150,
    color: '#50C878', // 翡翠绿
    icon: 'pause',
  },
  '追': {
    type: '追',
    name: '追马',
    description: '善于追赶的马，从后方追赶超越对手',
    zonePositions: [9, 10, 11], // 赛道最后方的三个格子
    bonusMileage: 120,
    color: '#FF6B6B', // 红色
    icon: 'chase',
  },
};

// 获取跑法配置
export const getRunningStyleConfig = (type: string): RunningStyleConfig => {
  return RUNNING_STYLES[type];
};

// 获取所有跑法类型
export const getAllRunningStyleTypes = (): string[] => {
  return Object.keys(RUNNING_STYLES);
};

// 赛道配置
export const TRACK_CONFIG = {
  totalCells: 12, // 总格子数
  cellLabels: ['逃', '逃', '逃', '先', '先', '先', '差', '差', '差', '追', '追', '追'],
};

// 骰子配置
export const DICE_CONFIG = {
  min: 1,
  max: 3,
  faces: [1, 2, 3],
};

// 默认回合数范围
export const DEFAULT_ROUND_RANGE = {
  min: 5,
  max: 20,
  default: 10,
};

// 玩家颜色配置
export const PLAYER_COLORS = ['#F4A460', '#8B4513', '#50C878', '#FF6B6B', '#9370DB', '#20B2AA'];