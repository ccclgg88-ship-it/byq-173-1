import type { PersonaResult, CompatibilityReport, ThemeId, QuizQuestion } from '../../shared/types';

const PERSONA_POOLS: Record<ThemeId, { titles: string[]; descriptions: Record<string, string> }> = {
  social: {
    titles: [
      '社交能量站', '氛围制造机', '温暖小太阳', '社交蝴蝶',
      '圈层连接者', '派对灵魂', '话题终结者', '聚会守护者',
      '人群观测者', '隐身社交家', '选择性社交者', '深度连接者'
    ],
    descriptions: {
      '社交能量站': '你在人群中自带充能光环，走到哪里都能让气氛升温，朋友们的快乐源泉。',
      '氛围制造机': '你有一种超能力——让每个场合都变得有趣，沉默在你面前无处遁形。',
      '温暖小太阳': '你的善意和温柔是社交场上的稀缺资源，别人总喜欢靠近你取暖。',
      '社交蝴蝶': '你的社交雷达永远开着，任何局都能如鱼得水，朋友圈大得惊人。',
      '圈层连接者': '你是不同社交圈之间的桥梁，总在无意间促成新的连接和缘分。',
      '派对灵魂': '没有你的聚会是不完整的，你一出场全场能量值直接拉满。',
      '话题终结者': '你不太擅长找话题，但一开口就很有质量，深藏不露的社交高手。',
      '聚会守护者': '你总是默默照顾每个人，确保没人被冷落，是聚会里最可靠的存在。',
      '人群观测者': '你更喜欢观察而非表演，但你洞若观火的观察力让朋友们惊叹。',
      '隐身社交家': '你低调到像开了隐身术，但每次出手都恰到好处，闷声发大财。',
      '选择性社交者': '你只把能量给值得的人，宁缺毋滥，朋友不多但个个精品。',
      '深度连接者': '你不喜欢泛泛之交，你追求的灵魂共振比点赞之交珍贵一万倍。'
    }
  },
  love: {
    titles: [
      '浪漫主义诗人', '温柔治愈者', '热烈追光者', '守护型恋人',
      '理性浪漫派', '恋爱哲学家', '心跳收集者', '安全感供应商',
      '心动制造机', '深情守望者', '慢热暖阳', '灵魂共振者'
    ],
    descriptions: {
      '浪漫主义诗人': '你相信爱情的每一个细节都值得被仪式感对待，浪漫是你的出厂设置。',
      '温柔治愈者': '你的温柔不是软弱，而是一种强大的力量，能治愈爱人的所有不安。',
      '热烈追光者': '你爱起来像一场烟花，热烈且绚烂，让伴侣感受到被全力以赴地爱着。',
      '守护型恋人': '你用行动而非言语表达爱，你的爱是风雨里最稳固的避风港。',
      '理性浪漫派': '你清醒地爱着，既能享受甜蜜又能保持独立，是最高级的浪漫。',
      '恋爱哲学家': '你对爱情有自己独特的理解，每段感情都是一次灵魂的修行。',
      '心跳收集者': '你迷恋心动的感觉，每一段暗恋和暧昧都是你收藏的珍宝。',
      '安全感供应商': '你的稳定和可靠是爱情里最稀缺的资源，和你在一起就是最大的安心。',
      '心动制造机': '你天生就懂得如何让对方怦然心动，不经意间就能制造甜蜜瞬间。',
      '深情守望者': '你的爱是漫长岁月里的守护，不需要轰轰烈烈却始终如一。',
      '慢热暖阳': '你不会一见钟情，但一旦爱上就像冬日的暖阳，温暖而持久。',
      '灵魂共振者': '你追求的不是外在的般配而是内心的共鸣，是灵魂伴侣的忠实信徒。'
    }
  },
  career: {
    titles: [
      '战略指挥官', '创意引擎', '效率机器', '团队粘合剂',
      '问题终结者', '远见规划师', '细节大师', '变革推动者',
      '稳如磐石', '破局先锋', '执行达人', '职场观察家'
    ],
    descriptions: {
      '战略指挥官': '你天生擅长从全局看问题，能在混乱中找到最优路径，是团队的定海神针。',
      '创意引擎': '你的大脑是创意的永动机，总能在山穷水尽时柳暗花明，提供颠覆性方案。',
      '效率机器': '你追求极致效率，能在最短时间内交付最高质量成果，是执行力的天花板。',
      '团队粘合剂': '你是团队里不可或缺的润滑剂，能化解一切摩擦，让1+1>2成为常态。',
      '问题终结者': '没有你解决不了的难题，你享受攻克难关的过程，bug在你面前无所遁形。',
      '远见规划师': '你总能比别人早三步看到未来，是职场上的棋手，每一步都胸有成竹。',
      '细节大师': '魔鬼藏在细节里，而你恰恰能捕捉到这些魔鬼，让完美成为标准而非例外。',
      '变革推动者': '你不满足于现状，永远在寻找更好的方式，是推动组织进化的核心力量。',
      '稳如磐石': '你是团队里最让人安心的存在，无论风浪多大你都能稳住阵脚。',
      '破局先锋': '当所有人都在原地打转时，你敢于打破常规，开辟出全新的战场。',
      '执行达人': '从想法到落地你一手包办，说到做到的靠谱程度让领导放心、同事钦佩。',
      '职场观察家': '你冷静观察职场生态，深谙规则却不被规则束缚，是最低调的聪明人。'
    }
  }
};

const TAG_POOLS: Record<ThemeId, string[]> = {
  social: [
    '外向活泼', '社恐本恐', '氛围担当', '话题终结',
    '破冰高手', '倾听达人', '朋友圈C位', '选择性社交',
    '聚会发起者', '隐身模式', '深交主义者', '社交雷达',
    '温暖治愈', '幽默风趣', '察言观色', '自来熟',
    '慢热型', '人群充电', '独处恢复', '局内人'
  ],
  love: [
    '浪漫至上', '理性恋爱', '主动出击', '被动等待',
    '仪式感满分', '安全感优先', '心跳派', '陪伴派',
    '独立空间', '黏人属性', '心动小能手', '深情专一',
    '慢热暖阳', '一见钟情', '灵魂共鸣', '细水长流',
    '霸道总裁', '小奶狗/猫', '醋王本王', '佛系恋爱'
  ],
  career: [
    '战略思维', '执行力爆表', '创意无限', '细节控',
    '团队协作', '独狼选手', '完美主义', '效率优先',
    '人脉达人', '技术钻研', '领导力强', '踏实可靠',
    '变革推动', '稳定输出', '快速学习', '目标导向',
    '抗压之王', '佛系打工人', '卷王本王', '时间管理'
  ]
};

const QUIZ_QUESTIONS: Record<ThemeId, QuizQuestion[]> = {
  social: [
    {
      id: 1,
      question: '周末收到三个聚会邀请，时间冲突了，你会：',
      options: ['全部推掉，在家追剧最香', '选最熟的那个局去', '努力赶场，一个都不能少', '看心情随机选一个']
    },
    {
      id: 2,
      question: '在一个都是陌生人的社交场合，你的状态是：',
      options: ['主动找话题破冰，10分钟交3个朋友', '找到一两个人深入聊，质量比数量重要', '默默观察全场，内心戏比对话还多', '存在感为零，但走的时候大家都说"你也在啊"']
    },
    {
      id: 3,
      question: '朋友突然取消约会，你的第一反应是：',
      options: ['有点失落，但马上约其他人', '松了口气，正好可以独处', '无所谓，自己玩也挺开心', '追问原因，担心朋友是不是出事了']
    },
    {
      id: 4,
      question: '你在朋友圈的日常是：',
      options: ['日更选手，生活碎片全记录', '偶尔冒泡，只发重要时刻', '只看不发，默默给所有人点赞', '精心策划每一篇，堪比公众号运营']
    },
    {
      id: 5,
      question: '有人当面夸你，你会：',
      options: ['大方接受，顺便夸回去', '表面谦虚，内心暗爽', '尴尬到想原地消失', '认真分析对方是不是有求于你']
    }
  ],
  love: [
    {
      id: 1,
      question: '第一次约会，你会更关注对方的：',
      options: ['谈吐和眼神交流', '穿着和品味细节', '幽默感和气氛', '对你的在意程度']
    },
    {
      id: 2,
      question: '恋爱中，你更需要的「爱的语言」是：',
      options: ['甜言蜜语和肯定的话语', '精心准备的惊喜和礼物', '无微不至的照顾和陪伴', '尊重你的空间和选择']
    },
    {
      id: 3,
      question: '吵架后，你通常会：',
      options: ['主动认错求和，不冷战', '需要独处冷静，再好好谈', '写小作文理清思路再沟通', '买好吃的给对方，用行动道歉']
    },
    {
      id: 4,
      question: '发现喜欢的人有对象了，你会：',
      options: ['默默退出，绝不插足', '难受但控制不住偷偷关注', '迅速转移注意力，下一个更乖', '安慰自己反正比对方对象优秀']
    },
    {
      id: 5,
      question: '你觉得最浪漫的事是：',
      options: ['收到一封手写的情书', '深夜里突然收到对方说想你了', '生病时对方不请自来照顾你', '被当着所有人的面表白']
    }
  ],
  career: [
    {
      id: 1,
      question: '接到一个完全没做过的任务，你的第一反应是：',
      options: ['兴奋！新的挑战来了', '先Google一下别人怎么做的', '列个详细的执行计划', '找有经验的同事请教']
    },
    {
      id: 2,
      question: '团队讨论时，你通常是：',
      options: ['提出大胆创意的那个', '找出方案漏洞的那个', '把想法落地成执行步骤的', '协调不同意见的那个']
    },
    {
      id: 3,
      question: '遇到特别难搞的甲方/老板，你会：',
      options: ['用数据和逻辑说服对方', '先顺着来再慢慢引导', '直接表达不同意见，据理力争', '默默按对方要求改，但内心翻白眼']
    },
    {
      id: 4,
      question: '你的工作桌面状态是：',
      options: ['极简主义，一尘不染', '看似混乱但我能秒找到任何东西', '贴满便利贴和待办清单', '工作区和休闲区泾渭分明']
    },
    {
      id: 5,
      question: '年底评优，你最想得到的认可类型是：',
      options: ['最佳创新奖', '最高效率奖', '最佳团队贡献奖', '最稳定输出奖']
    }
  ]
};

const RELATIONSHIP_TYPES = [
  '最佳拍档', '相爱相杀', '互补搭子', '灵魂共鸣',
  '欢喜冤家', '默契战友', '温暖港湾', '脑洞同盟'
];

export function generatePersona(
  userId: string,
  assessmentId: string,
  theme: ThemeId
): Omit<PersonaResult, 'createdAt'> {
  const pool = PERSONA_POOLS[theme];
  const tagPool = TAG_POOLS[theme];

  const shuffledTags = [...tagPool].sort(() => Math.random() - 0.5);
  const tags = shuffledTags.slice(0, 5);
  const title = pool.titles[Math.floor(Math.random() * pool.titles.length)];
  const description = pool.descriptions[title] ||
    `你是独一无二的「${title}」，有着自己独特的魅力和光芒。`;

  return {
    id: assessmentId,
    userId,
    theme,
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

  const mergedPool = [...TAG_POOLS[inviterPersona.theme] || [], ...TAG_POOLS[partnerPersona.theme] || []];
  const conflictPool = mergedPool.filter(t => !commonTags.includes(t));
  const conflictTags = [...new Set(conflictPool)].sort(() => Math.random() - 0.5).slice(0, 4);

  const relationshipType = RELATIONSHIP_TYPES[Math.floor(Math.random() * RELATIONSHIP_TYPES.length)];

  const descriptions: Record<string, string> = {
    '最佳拍档': '你们的默契度爆表！就像两块完美契合的拼图，在一起时总能创造出1+1>2的奇迹。',
    '相爱相杀': '你们的关系充满戏剧性火花，嘴上互相嫌弃心里却比谁都在意对方。',
    '互补搭子': '你擅长的正是TA需要的，TA的强项正好弥补你的不足，最完美的组合。',
    '灵魂共鸣': '你们的灵魂频率惊人地相似，很多时候不需要言语就能理解对方。',
    '欢喜冤家': '你们的日常就是打打闹闹，但每次小摩擦都会让感情更深一层。',
    '默契战友': '你们是彼此最坚实的后盾，无论遇到什么困难都能并肩作战。',
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

export function getQuizQuestions(theme: ThemeId): QuizQuestion[] {
  return QUIZ_QUESTIONS[theme] || QUIZ_QUESTIONS.social;
}

export { QUIZ_QUESTIONS };
