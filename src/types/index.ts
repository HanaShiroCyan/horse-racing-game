// 跑法类型
export type RunningStyleType = '逃' | '先' | '差' | '追';

// 跑法配置
export interface RunningStyleConfig {
  type: RunningStyleType;
  name: string;
  description: string;
  zonePositions: number[]; // 对应区域的格子位置索引（0-11）
  bonusMileage: number; // 在对应区域时的奖励里程
  color: string; // 主题颜色
  icon: string; // 图标标识
}

// 技能类型
export type SkillType = 
  | 'reinforced_body' // 钢筋铁骨 - 北部玄驹
  | 'reverse_burst' // 反向爆冲 - 双涡轮
  | 'pegasus_song' // 天马之歌 - 无声铃鹿
  | 'touch_world' // 触摸世界 - 神鹰
  | 'ultimate_dance' // 究极舞步 - 东海帝王
  | 'divine_presence' // 神临 - 小栗帽
  | 'glass_leg' // 玻璃腿 - 爱丽速子
  | 'hero' // 英雄 - 大震撼
  | 'tyrant' // 暴君 - 黄金巨匠
  | 'burning_blood' // 燃血 - 伏特加
  | 'realized_race' // 原来我在比赛啊 - 黄金船
  | 'coward' // 胆小鬼 - 成田白仁;

// 技能配置
export interface SkillConfig {
  id: SkillType;
  name: string;
  description: string;
  isActive: boolean; // 是否为主动技能
  maxUses?: number; // 最大使用次数
  cooldown?: number; // 冷却回合数
  triggerType: 'move' | 'settle' | 'round_start' | 'passive';
}

// 角色配置
export interface Character {
  id: string;
  name: string;
  runningStyle: RunningStyleType;
  skill: SkillConfig;
  avatar: string; // emoji或图标
  color: string; // 角色主题色
}

// 玩家技能状态
export interface PlayerSkillState {
  skillId: SkillType;
  usesRemaining: number; // 剩余使用次数
  cooldown: number; // 剩余冷却回合
  isActive: boolean; // 技能是否处于激活状态
  extraData: Record<string, any>; // 技能特有数据
}

// 回合历史记录
export interface RoundHistory {
  roundNumber: number;
  diceValue: number;
  startPosition: number;
  endPosition: number;
  wasInZone: boolean; // 是否在对应区域
  mileageGain: number;
}

// 玩家数据
export interface Player {
  id: string;
  name: string;
  character: Character;
  runningStyle: RunningStyleType;
  position: number; // 当前位置（0-11）
  initialPosition: number; // 起始位置
  mileage: number; // 总里程数
  isAI: boolean;
  color: string;
  skillState: PlayerSkillState;
  history: RoundHistory[]; // 历史记录
}

// 技能触发效果（用于UI展示）
export interface SkillEffect {
  playerId: string;
  playerName: string;
  skillName: string;
  effect: string;
  type: 'buff' | 'debuff' | 'neutral';
}

// 游戏阶段
export type GamePhase = 'setup' | 'playing' | 'finished';

// 游戏状态
export interface GameState {
  phase: GamePhase;
  currentPlayerId: string | null;
  diceValue: number | null;
  moveDirection: 'left' | 'right' | null;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  isDiceRolling: boolean;
  showResult: boolean;
  skillEffects: SkillEffect[];
  turnOrder: string[]; // 当前回合的出手顺序
  currentTurnIndex: number; // 当前回合中的玩家索引
}

// 游戏配置
export interface GameConfig {
  totalRounds: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

// 移动结果
export interface MoveResult {
  playerId: string;
  startPosition: number;
  endPosition: number;
  diceValue: number;
  mileageGain: number;
  isInBonusZone: boolean;
  path: number[]; // 移动路径（包含转身点）
  skillEffects: SkillEffect[]; // 移动中触发的技能效果
}

// 回合记录
export interface RoundRecord {
  roundNumber: number;
  moves: MoveResult[];
}