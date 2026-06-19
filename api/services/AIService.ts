import type { PersonaResult, CompatibilityReport } from '../../shared/types';

const PERSONA_TITLES = [
  '浪漫主义诗人', '深夜哲学家', '社交能量站', '温柔治愈者',
  '理性分析师', '创意冒险家', '温暖小太阳', '敏锐观察者',
  '自由灵魂', '幽默制造机', '文艺青年', '冷静指挥官',
  '梦幻理想家', '实干行动派', '神秘思考者', '乐天派达人'
];

const TAG_POOL = [
  '外向活泼', '内向沉稳', '浪漫感性', '理性客观',
  '完美主义', '随性自由', '温暖治愈', '幽默风趣',
  '文艺浪漫', '冒险精神', '踏实可靠', '奇思妙想',
  '敏感细腻', '乐观积极', '独立坚强', '善于倾听',
  '创意无限', '逻辑清晰', '热情似火', '温柔如水'
];

const RELATIONSHIP_TYPES = [
  '最佳拍档', '相爱相杀', '互补搭子', '灵魂共鸣',
  '欢喜冤家', '默契战友', '温暖港湾', '脑洞同盟'
];

export function generatePersona(userId: string, assessmentId: string): Omit<PersonaResult, 'createdAt'> {
  const shuffledTags = [...TAG_POOL].sort(() => Math.random() - 0.5);
  const tags = shuffledTags.slice(0, 5);
  const title = PERSONA_TITLES[Math.floor(Math.random() * PERSONA_TITLES.length)];

  const descriptions: Record<string, string> = {
    '浪漫主义诗人': '你内心住着一位诗人，对世界充满温柔的想象，善于发现生活中的小确幸。',
    '深夜哲学家': '夜深人静时思维最活跃，喜欢思考人生的终极问题，有着独特的世界观。',
    '社交能量站': '人群中的你总是活力四射，像小太阳一样温暖周围的人，是天生的氛围担当。',
    '温柔治愈者': '你有着与生俱来的共情能力，总能察觉到他人的情绪变化，是朋友们的心灵港湾。',
    '理性分析师': '面对问题时冷静客观，善于从复杂信息中抽丝剥茧，找到最优解。',
    '创意冒险家': '你的大脑永远有新奇的点子，敢于尝试别人不敢做的事情，生活充满惊喜。',
    '温暖小太阳': '你的正能量有感染力，只要有你在，整个房间的氛围都会变得明亮起来。',
    '敏锐观察者': '你注意到别人忽略的细节，有着惊人的洞察力，看人看事特别准。'
  };

  const description = descriptions[title] ||
    `你是独一无二的「${title}」，有着自己独特的魅力和光芒。`;

  return {
    id: assessmentId,
    userId,
    title,
    tags,
    description
  };
}

export function generateCompatibilityReport(
  inviterPersona: PersonaResult,
  partnerPersona: PersonaResult
): CompatibilityReport {
  const score = Math.floor(Math.random() * 31) + 70;

  const allTags = [...new Set([...inviterPersona.tags, ...partnerPersona.tags])];
  const commonTagsSet = inviterPersona.tags.filter(t => partnerPersona.tags.includes(t));

  let commonTags: string[];
  if (commonTagsSet.length >= 3) {
    commonTags = commonTagsSet.slice(0, 5);
  } else {
    const extraNeeded = 3 - commonTagsSet.length;
    const candidates = allTags.filter(t => !commonTagsSet.includes(t));
    const extras = candidates.sort(() => Math.random() - 0.5).slice(0, extraNeeded);
    commonTags = [...commonTagsSet, ...extras];
  }

  const conflictPool = TAG_POOL.filter(t => !commonTags.includes(t));
  const conflictTags = conflictPool.sort(() => Math.random() - 0.5).slice(0, 4);

  const relationshipType = RELATIONSHIP_TYPES[Math.floor(Math.random() * RELATIONSHIP_TYPES.length)];

  const descriptions: Record<string, string> = {
    '最佳拍档': '你们的默契度爆表！就像两块完美契合的拼图，在一起时总能创造出1+1>2的奇迹。',
    '相爱相杀': '你们的关系充满戏剧性火花，嘴上互相嫌弃心里却比谁都在意对方，这种互动方式旁人羡慕不来。',
    '互补搭子': '你擅长的正是TA需要的，TA的强项正好弥补你的不足，你们在一起就是最完美的组合。',
    '灵魂共鸣': '你们的灵魂频率惊人地相似，很多时候不需要言语就能理解对方，是难得的知己。',
    '欢喜冤家': '你们的日常就是打打闹闹，但每次小摩擦都会让感情更深一层，是一对让人羡慕的欢喜冤家。',
    '默契战友': '你们是彼此最坚实的后盾，无论遇到什么困难都能并肩作战，是值得托付的战友。',
    '温暖港湾': '和对方在一起时，你们都能卸下所有防备，在彼此的温柔中找到归属感。',
    '脑洞同盟': '你们的思维总是能碰撞出奇妙的火花，在一起时永远不缺话题和新点子。'
  };

  const description = descriptions[relationshipType] ||
    `你们是「${relationshipType}」，这段关系充满了无限可能。`;

  return {
    score,
    relationshipType,
    commonTags,
    conflictTags,
    description
  };
}

export function generateAnonymousTitle(): string {
  const adjectives = ['神秘的', '可爱的', '有趣的', '特别的', '温柔的', '勇敢的'];
  const nouns = ['小伙伴', '朋友', '旅人', '探索者', '梦想家', '冒险者'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '周末的清晨，你更倾向于：',
    options: ['睡到自然醒，窝在家里', '早起出门，拥抱新的一天', '和朋友约好一起出去玩', '制定详细的周末计划']
  },
  {
    id: 2,
    question: '面对突发状况时，你的第一反应是：',
    options: ['冷静分析，寻找解决方案', '有点慌张，需要时间适应', '积极乐观，相信车到山前必有路', '立刻寻求他人帮助']
  },
  {
    id: 3,
    question: '在朋友聚会中，你通常是：',
    options: ['话题中心，带动气氛', '认真倾听，适时发言', '默默观察，享受氛围', '和一两个好友深入聊天']
  },
  {
    id: 4,
    question: '你理想中的旅行方式是：',
    options: ['说走就走的背包冒险', '精心规划的深度游', '和朋友一起的欢乐之旅', '安静放松的度假休闲']
  },
  {
    id: 5,
    question: '遇到困难时，你更相信：',
    options: ['自己的判断和能力', '朋友的建议和支持', '直觉和内心的声音', '理性的分析和数据']
  }
];
