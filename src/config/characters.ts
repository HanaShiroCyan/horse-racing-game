import { Character } from '@/types';

export const CHARACTERS: Character[] = [
  {
    id: 'kitasan_black',
    name: '北部玄驹',
    runningStyle: '逃',
    skill: {
      id: 'reinforced_body',
      name: '钢筋铁骨',
      description: '技能CD3回合，一局最多使用2次。移动后可选择向左或向右额外移动一格。',
      isActive: true,
      maxUses: 2,
      cooldown: 3,
      triggerType: 'move',
    },
    avatar: '🖤',
    color: '#2d2d2d',
  },
  {
    id: 'double_turbo',
    name: '双涡轮',
    runningStyle: '逃',
    skill: {
      id: 'reverse_burst',
      name: '反向爆冲',
      description: '在逃马区域时，里程奖励从120变为150。投掷出1点后效果失效。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '⚡',
    color: '#00d4ff',
  },
  {
    id: 'silence_suzuka',
    name: '无声铃鹿',
    runningStyle: '逃',
    skill: {
      id: 'pegasus_song',
      name: '天马之歌',
      description: '3的倍数回合时，35%概率触发完美脚步，结算时额外+30里程。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '🦌',
    color: '#ffffff',
  },
  {
    id: 'eagle',
    name: '神鹰',
    runningStyle: '先',
    skill: {
      id: 'touch_world',
      name: '触摸世界',
      description: '若上一回合在先马区域，本回合额外+10里程。若本回合仍在先马区域，再额外+10里程。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '🦅',
    color: '#ff6b35',
  },
  {
    id: 'tokai_teio',
    name: '东海帝王',
    runningStyle: '先',
    skill: {
      id: 'ultimate_dance',
      name: '究极舞步',
      description: '从第3回合开始，若前两回合骰子点数和为4、5、6，则本回合额外+（点数和）*5里程。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '👑',
    color: '#ffd700',
  },
  {
    id: 'oguri_cap',
    name: '小栗帽',
    runningStyle: '先',
    skill: {
      id: 'divine_presence',
      name: '神临',
      description: '从非对应区域回到对应区域时，本回合+30，下回合+20，再下回合+10。可叠加。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '🎩',
    color: '#8b4513',
  },
  {
    id: 'agnes_tachyon',
    name: '爱丽速子',
    runningStyle: '先',
    skill: {
      id: 'glass_leg',
      name: '玻璃腿',
      description: '自带每回合+20里程buff。若不在对应区域的回合累计超过3次，变为每回合-10debuff。',
      isActive: false,
      triggerType: 'passive',
    },
    avatar: '🧬',
    color: '#9932cc',
  },
  {
    id: 'great_impact',
    name: '大震撼',
    runningStyle: '差',
    skill: {
      id: 'hero',
      name: '英雄',
      description: '从第2回合开始，若上一回合有其他马在对应区域触发奖励，本回合额外+20里程。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '💥',
    color: '#dc143c',
  },
  {
    id: 'golden_age',
    name: '黄金巨匠',
    runningStyle: '差',
    skill: {
      id: 'tyrant',
      name: '暴君',
      description: '每局可使用2次。回合开始时选择使用，75%概率成功使每个对手里程-20。',
      isActive: true,
      maxUses: 2,
      triggerType: 'round_start',
    },
    avatar: '👑',
    color: '#ffaa00',
  },
  {
    id: 'vodka',
    name: '伏特加',
    runningStyle: '差',
    skill: {
      id: 'burning_blood',
      name: '燃血',
      description: '回合开始时选择开启。开启后每回合+35里程，每回合结束60%概率判定成功，失败则关闭并扣减里程。',
      isActive: true,
      triggerType: 'round_start',
    },
    avatar: '🍷',
    color: '#4169e1',
  },
  {
    id: 'gold_ship',
    name: '黄金船',
    runningStyle: '追',
    skill: {
      id: 'realized_race',
      name: '原来我在比赛啊',
      description: '强制每回合最后出手。若其他对手都在对应区域，本回合额外+120里程，否则-20里程。',
      isActive: false,
      triggerType: 'settle',
    },
    avatar: '⛵',
    color: '#daa520',
  },
  {
    id: 'narita_taishin',
    name: '成田白仁',
    runningStyle: '追',
    skill: {
      id: 'coward',
      name: '胆小鬼',
      description: '使用四面骰（1-4），投出4点时额外+30里程。',
      isActive: false,
      triggerType: 'move',
    },
    avatar: '🐴',
    color: '#f0e68c',
  },
];

export const getCharactersByStyle = (style: string): Character[] => {
  return CHARACTERS.filter(c => c.runningStyle === style);
};

export const getCharacterById = (id: string): Character | undefined => {
  return CHARACTERS.find(c => c.id === id);
};

export const getRandomCharacter = (): Character => {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
};

export const getRandomCharacters = (count: number): Character[] => {
  const result: Character[] = [];
  const available = [...CHARACTERS];
  for (let i = 0; i < count && available.length > 0; i++) {
    const index = Math.floor(Math.random() * available.length);
    result.push(available[index]);
    available.splice(index, 1);
  }
  return result;
};