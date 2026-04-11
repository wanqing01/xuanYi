import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { zodiacSigns, zodiacSymbols, getDailySeededRandom } from '../../lib/fortune-data'
import './index.scss'

// ── 星座基础信息 ──────────────────────────────────────────────
const ZODIAC_INFO: Record<string, {
  element: string; planet: string; keywords: string[]
  luckyItems: string[]; luckyZodiac: string; cautions: string[]
  trait: string
}> = {
  '白羊座': {
    element: '火', planet: '火星', keywords: ['勇气', '行动', '热情'],
    luckyItems: ['红宝石', '铁器', '辣椒'], luckyZodiac: '狮子座',
    cautions: ['今日易冲动行事，遇事三思而后行', '口舌是非较多，说话注意分寸', '能量过旺，注意控制情绪避免与人争执', '行动前多做规划，避免虎头蛇尾'],
    trait: '白羊座天生勇敢，行动力极强，是十二星座中最具开拓精神的先锋。',
  },
  '金牛座': {
    element: '土', planet: '金星', keywords: ['稳定', '务实', '享受'],
    luckyItems: ['绿松石', '铜器', '玫瑰'], luckyZodiac: '摩羯座',
    cautions: ['今日固执倾向较强，适当听取他人意见', '消费欲望旺盛，注意控制开支', '变通能力不足，遇到变化需调整心态', '不要因为安逸而错失机会'],
    trait: '金牛座脚踏实地，重视物质安全感，对美好事物有天生的鉴赏力。',
  },
  '双子座': {
    element: '风', planet: '水星', keywords: ['灵活', '沟通', '好奇'],
    luckyItems: ['黄水晶', '书籍', '薰衣草'], luckyZodiac: '天秤座',
    cautions: ['今日注意力容易分散，专注一件事更有效率', '轻率承诺可能带来麻烦，谨慎表态', '信息繁杂，注意甄别真假', '避免同时开展太多计划'],
    trait: '双子座思维敏捷，口才出众，对新鲜事物充满好奇，是天生的沟通者。',
  },
  '巨蟹座': {
    element: '水', planet: '月亮', keywords: ['感性', '家庭', '直觉'],
    luckyItems: ['珍珠', '银器', '白色花卉'], luckyZodiac: '天蝎座',
    cautions: ['今日情绪波动较大，避免因小事钻牛角尖', '过度依赖他人可能适得其反，保持独立', '敏感度偏高，不要过度解读他人言行', '注意不要将情绪带入工作'],
    trait: '巨蟹座重情重义，对家人朋友极为忠诚，直觉敏锐，善于感知他人情绪。',
  },
  '狮子座': {
    element: '火', planet: '太阳', keywords: ['自信', '领导', '慷慨'],
    luckyItems: ['黄金', '琥珀', '向日葵'], luckyZodiac: '白羊座',
    cautions: ['今日自我意识较强，注意倾听他人想法', '避免过度炫耀，低调更能赢得尊重', '对认可的渴望可能影响判断，保持客观', '注意不要忽视身边人的感受'],
    trait: '狮子座天生具有领袖气质，热情慷慨，渴望被认可，是舞台上最耀眼的存在。',
  },
  '处女座': {
    element: '土', planet: '水星', keywords: ['完美', '分析', '服务'],
    luckyItems: ['碧玉', '薄荷', '白色系'], luckyZodiac: '金牛座',
    cautions: ['今日完美主义倾向较强，适当放低标准', '过度分析可能导致焦虑，学会放手', '批评他人前先审视自己', '不要因为追求细节而忽略大局'],
    trait: '处女座心思细腻，追求完美，分析能力强，是最可靠的实干家。',
  },
  '天秤座': {
    element: '风', planet: '金星', keywords: ['平衡', '美感', '外交'],
    luckyItems: ['蓝宝石', '铜镜', '玫瑰石英'], luckyZodiac: '双子座',
    cautions: ['今日决策困难，设定截止时间帮助自己做选择', '避免为了取悦所有人而委屈自己', '优柔寡断可能错失良机，果断一些', '注意不要逃避需要做的决定'],
    trait: '天秤座追求和谐与美感，善于外交，天生具有调解矛盾的能力。',
  },
  '天蝎座': {
    element: '水', planet: '冥王星', keywords: ['深邃', '洞察', '变革'],
    luckyItems: ['石榴石', '黑曜石', '深红色'], luckyZodiac: '巨蟹座',
    cautions: ['今日猜疑心较重，避免无端怀疑他人', '占有欲过强可能伤害感情，适当放手', '报复心理容易引发不必要的冲突', '注意不要将过去的伤害带入当下'],
    trait: '天蝎座洞察力极强，意志坚定，对感情极为专一，是最神秘深邃的星座。',
  },
  '射手座': {
    element: '火', planet: '木星', keywords: ['自由', '哲学', '冒险'],
    luckyItems: ['黄玉', '马具', '蓝色系'], luckyZodiac: '白羊座',
    cautions: ['今日言语直接，注意表达方式避免伤人', '耐心不足，重要事情需要坚持到底', '过度承诺可能无法兑现，量力而行', '自由散漫可能影响效率，适当约束自己'],
    trait: '射手座热爱自由，追求真理，乐观开朗，是十二星座中最具哲学气质的探险家。',
  },
  '摩羯座': {
    element: '土', planet: '土星', keywords: ['责任', '野心', '耐力'],
    luckyItems: ['黑玛瑙', '铅器', '深色系'], luckyZodiac: '金牛座',
    cautions: ['今日过于保守，适当冒险可能带来惊喜', '压抑情感不利于身心健康，学会表达', '工作狂倾向明显，注意休息避免过劳', '不要因为谨慎而错失好机会'],
    trait: '摩羯座意志坚定，目标明确，脚踏实地，是最有耐力和责任感的星座。',
  },
  '水瓶座': {
    element: '风', planet: '天王星', keywords: ['创新', '独立', '人道'],
    luckyItems: ['紫水晶', '电子产品', '蓝紫色'], luckyZodiac: '双子座',
    cautions: ['今日情感疏离倾向较强，主动关心身边人', '过于理性可能让人感到冷漠，增加温度', '固执己见时注意听取不同声音', '脱离现实的想法需要落地执行'],
    trait: '水瓶座思想超前，崇尚自由与平等，是最具创新精神和人道主义情怀的星座。',
  },
  '双鱼座': {
    element: '水', planet: '海王星', keywords: ['浪漫', '直觉', '慈悲'],
    luckyItems: ['海蓝宝', '贝壳', '薰衣草'], luckyZodiac: '天蝎座',
    cautions: ['今日逃避倾向较强，直面问题才能解决问题', '轻信他人可能被欺骗，保持适度警惕', '优柔寡断时设定时限帮助决策', '注意区分直觉与幻想'],
    trait: '双鱼座富有同情心，想象力丰富，直觉敏锐，是最具艺术气质和灵性的星座。',
  },
}

// ── 各维度文字解读（按分数段） ────────────────────────────────
const READINGS: Record<string, { great: string[]; good: string[]; warn: string[]; bad: string[] }> = {
  love: {
    great: [
      '桃花运极旺，感情甜蜜如蜜，单身者极易遇到心动之人，有伴侣者感情升温，浪漫气息弥漫。',
      '爱情运势大吉，双方心意相通，感情进展顺利，是表白或求婚的绝佳时机。',
      '感情运势爆棚，魅力四射，异性缘极佳，把握今日良机，主动出击必有收获。',
    ],
    good: [
      '感情运势不错，与伴侣相处融洽，单身者有机会结识新朋友，保持开放心态。',
      '爱情运势平稳向好，感情中有小惊喜，多一些浪漫举动会让关系更进一步。',
      '桃花运有所上升，今日适合约会或表达心意，真诚相待是最好的策略。',
    ],
    warn: [
      '感情运势一般，与伴侣可能有小摩擦，需要多一些耐心和包容，避免争吵。',
      '爱情方面需要用心经营，单身者缘分尚未到来，不必强求，顺其自然。',
      '感情上容易产生误会，沟通时注意措辞，多倾听对方的想法。',
    ],
    bad: [
      '感情运势低迷，与伴侣易生口角，需要冷静处理，避免冲动说出伤人的话。',
      '爱情方面有波折，单身者暂时缘分未到，已有伴侣者需要多加关心对方。',
      '感情运势欠佳，今日不宜谈论感情大事，给彼此一些空间和时间。',
    ],
  },
  career: {
    great: [
      '事业运势大旺，工作效率极高，贵人相助，升职加薪机会近在眼前，大胆争取。',
      '职场运势极佳，创意灵感涌现，领导对你刮目相看，是展示才华的最好时机。',
      '事业运势爆发，重要项目顺利推进，合作谈判成功率高，把握今日良机。',
    ],
    good: [
      '工作运势良好，思路清晰，执行力强，今日适合处理重要事务，效率较高。',
      '职场运势不错，与同事合作顺畅，工作中有小突破，继续保持积极态度。',
      '事业运势平稳向好，工作中遇到的问题都能顺利解决，稳步前进。',
    ],
    warn: [
      '工作运势一般，可能遇到一些小阻碍，保持耐心，按部就班完成任务即可。',
      '职场上需要谨慎行事，避免与同事产生摩擦，低调做事更为稳妥。',
      '事业运势平平，不宜做重大决策，先把手头工作做好，等待更好时机。',
    ],
    bad: [
      '工作运势欠佳，容易出现失误，做事需要反复检查，避免粗心大意。',
      '职场上有压力，可能遇到阻碍，保持冷静，寻求同事或上司的帮助。',
      '事业运势低迷，今日不宜开展新项目，专注于维护现有成果。',
    ],
  },
  wealth: {
    great: [
      '财运大旺，正财偏财皆有进账，投资理财回报丰厚，是出手的好时机。',
      '财运极佳，意外之财可能降临，商业谈判顺利，财富积累速度加快。',
      '财运爆棚，求财必得，适合开展新的财务计划，把握今日财运高峰。',
    ],
    good: [
      '财运不错，收入稳定，有小额意外收获，适合进行稳健的理财操作。',
      '财运平稳向好，今日适合处理财务事宜，投资决策较为准确。',
      '财运有所上升，节流开源两手抓，财务状况逐步改善。',
    ],
    warn: [
      '财运一般，收支基本平衡，避免大额消费，量入为出是今日原则。',
      '财运平平，不宜冒险投资，保守理财为上，防止不必要的财务损失。',
      '财运略有波动，注意防范财务风险，谨慎对待借贷事宜。',
    ],
    bad: [
      '财运欠佳，有破财风险，今日不宜进行大额投资或消费，谨慎为上。',
      '财运低迷，钱财容易外流，注意保管好财物，避免被骗或损失。',
      '财运不佳，今日不宜签订财务合同，推迟重要的财务决策。',
    ],
  },
  health: {
    great: [
      '健康运势极佳，精力充沛，体力旺盛，适合进行运动锻炼，身心状态绝佳。',
      '身体状态极好，免疫力强，精神饱满，今日适合挑战体能极限。',
      '健康运势大吉，气色红润，活力四射，保持良好的生活习惯即可。',
    ],
    good: [
      '健康状况良好，精神状态不错，注意劳逸结合，保持规律的作息。',
      '身体状态较好，适当运动有益健康，注意饮食均衡，多补充水分。',
      '健康运势平稳，身体无大碍，保持积极乐观的心态有助于健康。',
    ],
    warn: [
      '健康方面需要注意，可能感到疲惫，适当休息，避免过度劳累。',
      '身体状态一般，注意保暖防寒，饮食清淡，避免熬夜。',
      '健康运势略有下滑，注意肠胃健康，少吃辛辣刺激食物。',
    ],
    bad: [
      '健康运势欠佳，身体可能出现不适，注意休息，如有不适及时就医。',
      '身体状态较差，精力不足，今日不宜进行剧烈运动，以休养为主。',
      '健康方面需要特别注意，旧疾可能复发，保持充足睡眠，减少压力。',
    ],
  },
}

// ── 今日宜忌 ──────────────────────────────────────────────────
const DAILY_YI: Record<string, string[]> = {
  '白羊座': ['开拓新项目', '运动健身', '主动表白', '竞技比赛'],
  '金牛座': ['理财投资', '享受美食', '布置家居', '稳健经营'],
  '双子座': ['社交聚会', '学习新知', '写作创作', '短途旅行'],
  '巨蟹座': ['家庭聚会', '烹饪美食', '关心亲友', '整理家务'],
  '狮子座': ['公开演讲', '展示才华', '组织活动', '时尚打扮'],
  '处女座': ['整理规划', '细致工作', '健康养生', '学习提升'],
  '天秤座': ['社交活动', '艺术欣赏', '调解矛盾', '购物消费'],
  '天蝎座': ['深度研究', '秘密计划', '心理分析', '投资理财'],
  '射手座': ['户外探险', '学习哲学', '结交新友', '远途旅行'],
  '摩羯座': ['制定计划', '努力工作', '积累资源', '拜访长辈'],
  '水瓶座': ['创新思考', '公益活动', '科技探索', '结交奇人'],
  '双鱼座': ['艺术创作', '冥想静心', '帮助他人', '欣赏音乐'],
}

const DAILY_JI: Record<string, string[]> = {
  '白羊座': ['冲动决策', '与人争执', '鲁莽行事'],
  '金牛座': ['固执己见', '大额消费', '拒绝变化'],
  '双子座': ['三心二意', '散布谣言', '轻率承诺'],
  '巨蟹座': ['情绪化', '钻牛角尖', '过度依赖'],
  '狮子座': ['自我中心', '炫耀攀比', '忽视他人'],
  '处女座': ['过度挑剔', '焦虑担忧', '吹毛求疵'],
  '天秤座': ['优柔寡断', '取悦所有人', '逃避决定'],
  '天蝎座': ['猜疑嫉妒', '报复心理', '过度控制'],
  '射手座': ['言语伤人', '虎头蛇尾', '过度承诺'],
  '摩羯座': ['过于保守', '压抑情感', '工作过度'],
  '水瓶座': ['情感疏离', '固执己见', '脱离现实'],
  '双鱼座': ['逃避现实', '轻信他人', '优柔寡断'],
}

// ── 运行时数据 ────────────────────────────────────────────────
const luckyColors = ['红色', '金色', '蓝色', '绿色', '紫色', '白色', '黄色', '橙色', '粉色', '黑色']
const directions  = ['东方', '南方', '西方', '北方', '东南', '东北', '西南', '西北']

interface FortuneData {
  overall: number
  love: number;   loveText: string
  career: number; careerText: string
  wealth: number; wealthText: string
  health: number; healthText: string
  luckyNumber: number
  luckyColor: string
  luckyDirection: string
  luckyItem: string
  luckyZodiac: string
  advice: string
  keywords: string[]
  caution: string
}

function getReading(key: keyof typeof READINGS, score: number, seed: number): string {
  const pool = score >= 85 ? READINGS[key].great
    : score >= 70 ? READINGS[key].good
    : score >= 55 ? READINGS[key].warn
    : READINGS[key].bad
  return pool[Math.floor(seed * pool.length)]
}

// ── 简化行星位置引擎 ──────────────────────────────────────────
// 基于儒略日（Julian Day）计算各行星的近似黄道经度（0-359°）
// 精度约±2°，足够用于运势计算

function toJulianDay(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const A = Math.floor((14 - m) / 12)
  const Y = y + 4800 - A
  const M = m + 12 * A - 3
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y
    + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045
}

// 返回行星在黄道上的星座索引（0=白羊...11=双鱼）
function getPlanetSign(date: Date): {
  sun: number; moon: number; mercury: number
  venus: number; mars: number; jupiter: number
} {
  const jd = toJulianDay(date)
  const d = jd - 2451545.0  // J2000.0 起算

  // 太阳：约每30.44天过一个星座
  const sunLon = ((280.460 + 0.9856474 * d) % 360 + 360) % 360
  // 月亮：约每2.25天过一个星座
  const moonLon = ((218.316 + 13.176396 * d) % 360 + 360) % 360
  // 水星：约每7.6天过一个星座（近似）
  const mercuryLon = ((252.251 + 4.092317 * d) % 360 + 360) % 360
  // 金星：约每25天过一个星座
  const venusLon = ((181.979 + 1.602136 * d) % 360 + 360) % 360
  // 火星：约每57天过一个星座
  const marsLon = ((355.433 + 0.524039 * d) % 360 + 360) % 360
  // 木星：约每361天过一个星座
  const jupiterLon = ((34.351 + 0.083056 * d) % 360 + 360) % 360

  return {
    sun:     Math.floor(sunLon / 30),
    moon:    Math.floor(moonLon / 30),
    mercury: Math.floor(mercuryLon / 30),
    venus:   Math.floor(venusLon / 30),
    mars:    Math.floor(marsLon / 30),
    jupiter: Math.floor(jupiterLon / 30),
  }
}

// 星座索引 → 名称
const SIGN_NAMES = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座',
                    '天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座']

// 行星与星座的相性（0=中性，正=加分，负=减分）
// 基于传统占星：行星在其守护/旺势星座得分高，在弱势/落陷星座得分低
const PLANET_AFFINITY: Record<string, number[]> = {
  // 太阳：狮子旺，白羊强，天秤弱，天蝎落
  sun:     [ 2, 0, 0, 0, 3, 0,-1,-2, 1, 0, 0, 0],
  // 月亮：巨蟹旺，金牛强，摩羯弱，天蝎落
  moon:    [ 0, 2, 0, 3, 0, 0, 0,-1, 0,-2, 0, 1],
  // 水星：双子/处女旺，射手/双鱼弱
  mercury: [ 0, 0, 3, 0, 0, 3, 0, 0,-2, 0, 0,-2],
  // 金星：金牛/天秤旺，白羊/天蝎弱
  venus:   [-1, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1],
  // 火星：白羊/天蝎旺，金牛/天秤弱
  mars:    [ 3, 0, 0, 0, 1, 0,-1, 2, 0, 0, 0, 0],
  // 木星：射手/双鱼旺，双子/处女弱
  jupiter: [ 0, 0,-1, 0, 0,-1, 0, 0, 3, 0, 0, 3],
}

// 行星对各维度的影响权重
const PLANET_DIMENSION: Record<string, Record<string, number>> = {
  sun:     { overall: 2, career: 2, love: 1, wealth: 1, health: 1 },
  moon:    { overall: 1, career: 0, love: 3, wealth: 0, health: 2 },
  mercury: { overall: 1, career: 2, love: 1, wealth: 1, health: 0 },
  venus:   { overall: 1, career: 0, love: 3, wealth: 2, health: 0 },
  mars:    { overall: 1, career: 2, love: 1, wealth: 1, health: 2 },
  jupiter: { overall: 2, career: 1, love: 1, wealth: 3, health: 1 },
}

// 根据行星位置计算星座当日各维度加成（-15 ~ +15）
function calcPlanetBonus(zodiacIdx: number, planets: ReturnType<typeof getPlanetSign>): Record<string, number> {
  const bonus: Record<string, number> = { overall: 0, love: 0, career: 0, wealth: 0, health: 0 }

  for (const [planet, signIdx] of Object.entries(planets)) {
    const affinity = PLANET_AFFINITY[planet]?.[signIdx] ?? 0
    const dims = PLANET_DIMENSION[planet] ?? {}
    // 行星与当前星座的相性（行星在哪个星座影响全体，但对守护星座的星座影响更大）
    const guardianBonus = (signIdx === zodiacIdx) ? 1 : 0
    const totalAffinity = affinity + guardianBonus

    for (const [dim, weight] of Object.entries(dims)) {
      bonus[dim] = (bonus[dim] || 0) + totalAffinity * weight
    }
  }

  // 归一化到 -15 ~ +15
  for (const k of Object.keys(bonus)) {
    bonus[k] = Math.max(-15, Math.min(15, Math.round(bonus[k])))
  }
  return bonus
}

// 根据行星位置生成今日关键词（动态）
function getDailyKeywords(planets: ReturnType<typeof getPlanetSign>, zodiacIdx: number): string[] {
  const moonSign = planets.moon
  const venusSign = planets.venus
  const marsSign = planets.mars

  const moonKeywords: Record<number, string> = {
    0:'冲劲', 1:'稳健', 2:'灵动', 3:'感性', 4:'自信', 5:'细致',
    6:'平衡', 7:'深邃', 8:'豁达', 9:'务实', 10:'创新', 11:'直觉',
  }
  const venusKeywords: Record<number, string> = {
    0:'热情', 1:'享受', 2:'沟通', 3:'温柔', 4:'魅力', 5:'优雅',
    6:'和谐', 7:'神秘', 8:'浪漫', 9:'克制', 10:'独特', 11:'梦幻',
  }
  const marsKeywords: Record<number, string> = {
    0:'行动', 1:'坚持', 2:'机智', 3:'守护', 4:'领导', 5:'专注',
    6:'合作', 7:'变革', 8:'探索', 9:'奋斗', 10:'突破', 11:'包容',
  }

  return [
    moonKeywords[moonSign] || '感悟',
    venusKeywords[venusSign] || '美好',
    marsKeywords[marsSign] || '前行',
  ]
}

// 根据金星位置生成贵人星座（动态）
function getLuckyZodiac(planets: ReturnType<typeof getPlanetSign>): string {
  // 金星所在星座的对宫（相差6个星座）为贵人
  const luckyIdx = (planets.venus + 6) % 12
  return SIGN_NAMES[luckyIdx]
}

// 根据月亮位置生成今日建议（动态）
const MOON_ADVICE: Record<number, string[]> = {
  0:  ['今日月亮过白羊，行动力旺盛，适合主动出击，把握先机。', '月入白羊，冲劲十足，勇于尝试新事物，但注意不要冲动。'],
  1:  ['月亮行经金牛，今日宜享受生活，稳扎稳打，财运有所提升。', '月入金牛，感官敏锐，适合品味美好，理财决策更为稳健。'],
  2:  ['月过双子，思维活跃，社交运旺，信息交流带来意外收获。', '月入双子，灵感涌现，适合学习新知，多与人交流有惊喜。'],
  3:  ['月亮归巢（巨蟹），情感细腻，家庭运势佳，直觉特别准确。', '月入巨蟹，情绪敏感，关注内心感受，家人的支持是今日力量。'],
  4:  ['月过狮子，自信心爆棚，今日适合展示自我，魅力四射。', '月入狮子，创造力强，勇于表达，今日的你格外耀眼。'],
  5:  ['月行处女，细心谨慎，今日适合处理细节事务，效率极高。', '月入处女，分析力强，注重健康，今日做事一丝不苟。'],
  6:  ['月过天秤，人际关系和谐，合作运旺，美感与平衡感提升。', '月入天秤，追求公平，今日适合谈判协商，人缘极佳。'],
  7:  ['月入天蝎，洞察力超强，今日直觉准确，适合深度思考。', '月过天蝎，情感深沉，今日适合处理重要事务，专注力强。'],
  8:  ['月行射手，乐观开朗，今日视野开阔，适合规划未来。', '月入射手，自由奔放，今日适合学习和旅行，运气不错。'],
  9:  ['月过摩羯，务实稳重，今日适合处理工作和财务，效率高。', '月入摩羯，责任感强，今日踏实努力必有回报。'],
  10: ['月行水瓶，思维创新，今日适合头脑风暴，人道主义精神旺。', '月入水瓶，独立自主，今日适合社群活动，创意灵感涌现。'],
  11: ['月过双鱼，直觉与灵感并发，今日适合艺术创作和冥想。', '月入双鱼，感受力强，今日适合帮助他人，心灵得到滋养。'],
}

function getDailyAdvice(planets: ReturnType<typeof getPlanetSign>, seed: number): string {
  const pool = MOON_ADVICE[planets.moon] || ['今日运势平稳，保持积极心态，顺势而为。']
  return pool[Math.floor(seed * pool.length)]
}


export default function DailyPage() {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [today, setToday] = useState(() => new Date())

  // 每次切换到此 tab 时刷新时间，确保跨天后日期正确
  useDidShow(() => {
    setToday(new Date())
  })

  const dateStr = useMemo(
    () => `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    [today]
  )

  const generateFortune = (zodiac: string): FortuneData => {
    const zodiacIndex = zodiacSigns.indexOf(zodiac)
    const seed = (offset: number) => getDailySeededRandom(today, zodiacIndex * 100 + offset)
    const info = ZODIAC_INFO[zodiac]

    // 行星位置计算
    const planets = getPlanetSign(today)
    const bonus   = calcPlanetBonus(zodiacIndex, planets)

    // 基础分 + 行星加成（保证在60-99范围内）
    const clamp = (v: number) => Math.max(55, Math.min(99, v))
    const love    = clamp(Math.floor(seed(2) * 30) + 65 + bonus.love)
    const career  = clamp(Math.floor(seed(3) * 30) + 65 + bonus.career)
    const wealth  = clamp(Math.floor(seed(4) * 30) + 65 + bonus.wealth)
    const health  = clamp(Math.floor(seed(5) * 30) + 65 + bonus.health)
    const overall = clamp(Math.round((love + career + wealth + health) / 4 + bonus.overall))

    return {
      overall,
      love,    loveText:   getReading('love',   love,   seed(12)),
      career,  careerText: getReading('career', career, seed(13)),
      wealth,  wealthText: getReading('wealth', wealth, seed(14)),
      health,  healthText: getReading('health', health, seed(15)),
      luckyNumber:    Math.floor(seed(6) * 9) + 1,
      luckyColor:     luckyColors[Math.floor(seed(7) * luckyColors.length)],
      luckyDirection: directions[Math.floor(seed(8) * directions.length)],
      luckyItem:      info.luckyItems[Math.floor(seed(10) * info.luckyItems.length)],
      luckyZodiac:    getLuckyZodiac(planets),          // 动态：金星对宫
      advice:         getDailyAdvice(planets, seed(11)), // 动态：月亮建议
      keywords:       getDailyKeywords(planets, zodiacIndex), // 动态：行星关键词
      caution:        info.cautions[Math.floor(seed(16) * info.cautions.length)],
    }
  }

  const handleSelectZodiac = (zodiac: string) => {
    setSelectedZodiac(zodiac)
    setIsLoading(true)
    setTimeout(() => {
      setFortune(generateFortune(zodiac))
      setIsLoading(false)
    }, 1200)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'score-great'
    if (score >= 70) return 'score-good'
    if (score >= 55) return 'score-warn'
    return 'score-bad'
  }

  return (
    <View className='daily-page'>
      <View className='page-header'>
        <Text className='page-title'>今日运势</Text>
        <Text className='page-subtitle'>{dateStr}</Text>
      </View>

      {!selectedZodiac && (
        <View className='zodiac-grid'>
          <Text className='select-hint'>请选择您的星座</Text>
          <View className='grid'>
            {zodiacSigns.map((zodiac, index) => (
              <View key={zodiac} className='zodiac-item' onClick={() => handleSelectZodiac(zodiac)}>
                <Text className='zodiac-symbol'>{zodiacSymbols[index]}</Text>
                <Text className='zodiac-name'>{zodiac}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {selectedZodiac && isLoading && (
        <View className='loading-area'>
          <Text className='loading-icon'>✧</Text>
          <Text className='loading-text'>正在为您推算运势...</Text>
        </View>
      )}

      {selectedZodiac && fortune && !isLoading && (
        <View className='fortune-result'>
          <View className='zodiac-info'>
            <Text className='zodiac-big'>{zodiacSymbols[zodiacSigns.indexOf(selectedZodiac)]}</Text>
            <Text className='zodiac-title'>{selectedZodiac}</Text>
            {/* 今日行星信息 */}
            {(() => {
              const p = getPlanetSign(today)
              return (
                <View className='planet-row'>
                  <Text className='planet-item'>☀ {SIGN_NAMES[p.sun]}</Text>
                  <Text className='planet-sep'>·</Text>
                  <Text className='planet-item'>☽ {SIGN_NAMES[p.moon]}</Text>
                  <Text className='planet-sep'>·</Text>
                  <Text className='planet-item'>♀ {SIGN_NAMES[p.venus]}</Text>
                </View>
              )
            })()}
          </View>

          <View className='fortune-card'>
            {/* 综合评分 */}
            <View className='overall-score'>
              <Text className='score-label'>综合运势</Text>
              <Text className={`score-value ${getScoreColor(fortune.overall)}`}>{fortune.overall}</Text>
              <Text className='score-max'>/ 100</Text>
            </View>

            {/* 关键词 */}
            <View className='keywords-row'>
              {fortune.keywords.map(k => (
                <View key={k} className='keyword-tag'><Text>{k}</Text></View>
              ))}
            </View>

            <View className='score-divider' />

            {/* 四维评分 + 文字解读 */}
            <View className='score-list'>
              {[
                { key: 'love',   icon: '♡', name: '爱情', text: fortune.loveText,   score: fortune.love },
                { key: 'career', icon: '◆', name: '事业', text: fortune.careerText, score: fortune.career },
                { key: 'wealth', icon: '◈', name: '财运', text: fortune.wealthText, score: fortune.wealth },
                { key: 'health', icon: '❖', name: '健康', text: fortune.healthText, score: fortune.health },
              ].map(cat => (
                <View key={cat.key} className='score-block'>
                  <View className='score-row'>
                    <Text className='score-icon'>{cat.icon}</Text>
                    <Text className='score-name'>{cat.name}</Text>
                    <View className='score-bar-bg'>
                      <View
                        className={`score-bar-fill ${getScoreColor(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </View>
                    <Text className={`score-num ${getScoreColor(cat.score)}`}>{cat.score}</Text>
                  </View>
                  <Text className='score-text'>{cat.text}</Text>
                </View>
              ))}
            </View>

            {/* 幸运信息 */}
            <View className='lucky-grid'>
              <View className='lucky-item'>
                <Text className='lucky-label'>幸运数字</Text>
                <Text className='lucky-value primary'>{fortune.luckyNumber}</Text>
              </View>
              <View className='lucky-item'>
                <Text className='lucky-label'>幸运颜色</Text>
                <Text className='lucky-value'>{fortune.luckyColor}</Text>
              </View>
              <View className='lucky-item'>
                <Text className='lucky-label'>幸运方位</Text>
                <Text className='lucky-value'>{fortune.luckyDirection}</Text>
              </View>
              <View className='lucky-item'>
                <Text className='lucky-label'>幸运物</Text>
                <Text className='lucky-value'>{fortune.luckyItem}</Text>
              </View>
              <View className='lucky-item'>
                <Text className='lucky-label'>贵人星座</Text>
                <Text className='lucky-value'>{fortune.luckyZodiac}</Text>
              </View>
            </View>

            {/* 今日宜忌 */}
            {selectedZodiac && (
              <View className='yiji-area'>
                <View className='yiji-col'>
                  <Text className='yiji-title yi'>今日宜</Text>
                  {(DAILY_YI[selectedZodiac] || []).map(item => (
                    <View key={item} className='yiji-item yi'>
                      <Text className='yiji-dot'>✓</Text>
                      <Text className='yiji-text'>{item}</Text>
                    </View>
                  ))}
                </View>
                <View className='yiji-divider' />
                <View className='yiji-col'>
                  <Text className='yiji-title ji'>今日忌</Text>
                  {(DAILY_JI[selectedZodiac] || []).map(item => (
                    <View key={item} className='yiji-item ji'>
                      <Text className='yiji-dot'>✗</Text>
                      <Text className='yiji-text'>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 注意事项 */}
            <View className='caution-area'>
              <Text className='caution-label'>⚠ 今日注意</Text>
              <Text className='caution-text'>{fortune.caution}</Text>
            </View>

            {/* 星座特质 */}
            <View className='advice-area'>
              <Text className='advice-label'>星座特质</Text>
              <Text className='advice-text'>{fortune.advice}</Text>
            </View>
          </View>

          <Button
            className='btn-ghost'
            onClick={() => { setSelectedZodiac(null); setFortune(null) }}
          >
            选择其他星座
          </Button>
        </View>
      )}
    </View>
  )
}
