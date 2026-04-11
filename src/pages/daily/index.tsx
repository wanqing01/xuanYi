import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { zodiacSigns, zodiacSymbols, fortuneCategories, getDailySeededRandom } from '../../lib/fortune-data'
import './index.scss'

// ── 星座基础信息 ──────────────────────────────────────────────
const ZODIAC_INFO: Record<string, {
  element: string; planet: string; keywords: string[]
  luckyItems: string[]; luckyZodiac: string; caution: string
  trait: string
}> = {
  '白羊座': {
    element: '火', planet: '火星', keywords: ['勇气', '行动', '热情'],
    luckyItems: ['红宝石', '铁器', '辣椒'], luckyZodiac: '狮子座',
    caution: '冲动行事，易与人发生口角',
    trait: '白羊座天生勇敢，行动力极强，是十二星座中最具开拓精神的先锋。',
  },
  '金牛座': {
    element: '土', planet: '金星', keywords: ['稳定', '务实', '享受'],
    luckyItems: ['绿松石', '铜器', '玫瑰'], luckyZodiac: '摩羯座',
    caution: '固执己见，变通能力不足',
    trait: '金牛座脚踏实地，重视物质安全感，对美好事物有天生的鉴赏力。',
  },
  '双子座': {
    element: '风', planet: '水星', keywords: ['灵活', '沟通', '好奇'],
    luckyItems: ['黄水晶', '书籍', '薰衣草'], luckyZodiac: '天秤座',
    caution: '三心二意，难以专注',
    trait: '双子座思维敏捷，口才出众，对新鲜事物充满好奇，是天生的沟通者。',
  },
  '巨蟹座': {
    element: '水', planet: '月亮', keywords: ['感性', '家庭', '直觉'],
    luckyItems: ['珍珠', '银器', '白色花卉'], luckyZodiac: '天蝎座',
    caution: '情绪化，容易钻牛角尖',
    trait: '巨蟹座重情重义，对家人朋友极为忠诚，直觉敏锐，善于感知他人情绪。',
  },
  '狮子座': {
    element: '火', planet: '太阳', keywords: ['自信', '领导', '慷慨'],
    luckyItems: ['黄金', '琥珀', '向日葵'], luckyZodiac: '白羊座',
    caution: '自我中心，需要关注',
    trait: '狮子座天生具有领袖气质，热情慷慨，渴望被认可，是舞台上最耀眼的存在。',
  },
  '处女座': {
    element: '土', planet: '水星', keywords: ['完美', '分析', '服务'],
    luckyItems: ['碧玉', '薄荷', '白色系'], luckyZodiac: '金牛座',
    caution: '过于挑剔，容易焦虑',
    trait: '处女座心思细腻，追求完美，分析能力强，是最可靠的实干家。',
  },
  '天秤座': {
    element: '风', planet: '金星', keywords: ['平衡', '美感', '外交'],
    luckyItems: ['蓝宝石', '铜镜', '玫瑰石英'], luckyZodiac: '双子座',
    caution: '优柔寡断，难以做决定',
    trait: '天秤座追求和谐与美感，善于外交，天生具有调解矛盾的能力。',
  },
  '天蝎座': {
    element: '水', planet: '冥王星', keywords: ['深邃', '洞察', '变革'],
    luckyItems: ['石榴石', '黑曜石', '深红色'], luckyZodiac: '巨蟹座',
    caution: '占有欲强，记仇',
    trait: '天蝎座洞察力极强，意志坚定，对感情极为专一，是最神秘深邃的星座。',
  },
  '射手座': {
    element: '火', planet: '木星', keywords: ['自由', '哲学', '冒险'],
    luckyItems: ['黄玉', '马具', '蓝色系'], luckyZodiac: '白羊座',
    caution: '缺乏耐心，言语直接易伤人',
    trait: '射手座热爱自由，追求真理，乐观开朗，是十二星座中最具哲学气质的探险家。',
  },
  '摩羯座': {
    element: '土', planet: '土星', keywords: ['责任', '野心', '耐力'],
    luckyItems: ['黑玛瑙', '铅器', '深色系'], luckyZodiac: '金牛座',
    caution: '过于保守，不善表达情感',
    trait: '摩羯座意志坚定，目标明确，脚踏实地，是最有耐力和责任感的星座。',
  },
  '水瓶座': {
    element: '风', planet: '天王星', keywords: ['创新', '独立', '人道'],
    luckyItems: ['紫水晶', '电子产品', '蓝紫色'], luckyZodiac: '双子座',
    caution: '过于理性，情感疏离',
    trait: '水瓶座思想超前，崇尚自由与平等，是最具创新精神和人道主义情怀的星座。',
  },
  '双鱼座': {
    element: '水', planet: '海王星', keywords: ['浪漫', '直觉', '慈悲'],
    luckyItems: ['海蓝宝', '贝壳', '薰衣草'], luckyZodiac: '天蝎座',
    caution: '逃避现实，容易被欺骗',
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


export default function DailyPage() {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const today = useMemo(() => new Date(), [])
  const dateStr = useMemo(() => `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`, [today])

  const generateFortune = (zodiac: string): FortuneData => {
    const zodiacIndex = zodiacSigns.indexOf(zodiac)
    const seed = (offset: number) => getDailySeededRandom(today, zodiacIndex * 100 + offset)
    const info = ZODIAC_INFO[zodiac]

    const love    = Math.floor(seed(2) * 40) + 60
    const career  = Math.floor(seed(3) * 40) + 60
    const wealth  = Math.floor(seed(4) * 40) + 60
    const health  = Math.floor(seed(5) * 40) + 60
    const overall = Math.round((love + career + wealth + health) / 4)

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
      luckyZodiac:    info.luckyZodiac,
      advice:         info.trait,
      keywords:       info.keywords,
      caution:        info.caution,
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
