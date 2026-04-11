/**
 * 奇门遁甲解读引擎
 * 根据盘面信息，针对不同问题类型给出专业解读
 */
import type { QimenChart, PalaceInfo } from './qimen-engine'
import { GATE_NATURE, STAR_NATURE, GOD_NATURE } from './qimen-engine'

// ─── 门、星、神详细含义 ──────────────────────────────────────

export const GATE_DETAIL: Record<string, { summary: string; career: string; wealth: string; love: string; health: string; travel: string }> = {
  '休门': {
    summary: '休门属水，主休息安逸，利于休养生息、谋划布局',
    career: '适合休整蓄力，不宜大动，可做计划准备',
    wealth: '财运平稳，宜守不宜攻，适合保守理财',
    love: '感情平淡稳定，宜维持现状，不宜强求进展',
    health: '利于休养调理，慢性病可好转，注意肾与膀胱',
    travel: '出行平安，宜短途，不宜远行冒险',
  },
  '生门': {
    summary: '生门属土，为八门中最吉之门，主生机勃发、万事顺遂',
    career: '事业大吉，创业开拓皆宜，贵人相助，升职有望',
    wealth: '财运旺盛，求财必得，投资经营皆利',
    love: '感情生机盎然，单身者易得良缘，已婚者感情升温',
    health: '身体健旺，生命力强，利于手术康复',
    travel: '出行大吉，一路顺风，利于远行求财',
  },
  '伤门': {
    summary: '伤门属木，主伤害口舌，易生是非争执',
    career: '工作易有纠纷，防小人暗算，不宜签约谈判',
    wealth: '财运受损，防破财，不宜投资冒险',
    love: '感情易生口角，防第三者，需多包容',
    health: '注意外伤、手术，肝胆需保养',
    travel: '出行有险，防交通意外，不宜远行',
  },
  '杜门': {
    summary: '杜门属木，主闭塞隐藏，利于保密防守',
    career: '事业受阻，宜守不宜进，适合幕后工作',
    wealth: '财路受阻，不宜大额投资，守财为上',
    love: '感情隐秘，不宜公开，暗中经营',
    health: '注意消化系统，情绪郁结需疏导',
    travel: '出行受阻，宜延期，若必须出行需防迷路',
  },
  '景门': {
    summary: '景门属火，主文书光明，利于考试文事',
    career: '利于文职、考试、创作，口才出众',
    wealth: '财运一般，适合文化产业投资',
    love: '感情明朗，适合表白，文艺活动增进感情',
    health: '注意心脏和眼睛，防虚火上炎',
    travel: '出行顺利，利于文化交流之旅',
  },
  '死门': {
    summary: '死门属土，为八门中最凶之门，主停滞结束',
    career: '事业停滞，不宜开始新项目，防失业',
    wealth: '财运极差，防大额损失，切勿投资',
    love: '感情危机，防分手离婚，需极力挽救',
    health: '健康堪忧，防重病，需及时就医',
    travel: '出行大凶，防意外，尽量避免出行',
  },
  '惊门': {
    summary: '惊门属金，主惊恐变动，易生意外',
    career: '工作有变动，防突发事件，保持冷静',
    wealth: '财运不稳，防意外损失，不宜冒险',
    love: '感情有变故，防突然分手，需稳定情绪',
    health: '注意神经系统，防惊吓，保持心态平稳',
    travel: '出行有惊险，防意外，需谨慎',
  },
  '开门': {
    summary: '开门属金，主开拓进取，利于开业求财',
    career: '事业开拓大吉，适合创业、开业、求职',
    wealth: '财运亨通，求财必得，适合开拓新财路',
    love: '感情开朗，适合主动追求，表白成功率高',
    health: '身体开朗，精力充沛，利于手术',
    travel: '出行大吉，利于开拓新路线，远行顺利',
  },
}

export const STAR_DETAIL: Record<string, { summary: string; meaning: string }> = {
  '天蓬': { summary: '天蓬星属水，主盗贼暗昧，凶险之象', meaning: '防小人暗害，财物失窃，事多阻碍' },
  '天芮': { summary: '天芮星属土，主疾病灾祸，凶险之象', meaning: '防疾病缠身，事业受阻，需谨慎行事' },
  '天冲': { summary: '天冲星属木，主冲动进取，吉中带险', meaning: '行事果断，但防冲动，适合开拓进取' },
  '天辅': { summary: '天辅星属木，为九星中最吉之星，主辅佐助力', meaning: '贵人相助，诸事顺遂，文事大吉' },
  '天禽': { summary: '天禽星属土，居中宫，主中正平和', meaning: '事情平稳，不偏不倚，守中为吉' },
  '天心': { summary: '天心星属金，主智慧决断，吉星', meaning: '智慧开启，决策正确，医疗大吉' },
  '天柱': { summary: '天柱星属金，主口舌是非，凶星', meaning: '防口舌纠纷，言多必失，谨言慎行' },
  '天任': { summary: '天任星属土，主稳重担当，吉星', meaning: '稳扎稳打，担当重任，事业稳固' },
  '天英': { summary: '天英星属火，主虚名浮华，凶星', meaning: '防虚名所累，表面光鲜内里空虚，防火灾' },
}

export const GOD_DETAIL: Record<string, { summary: string; meaning: string }> = {
  '值符': { summary: '值符为八神之首，主贵人相助，诸事顺遂', meaning: '得贵人扶持，官运亨通，诸事大吉' },
  '腾蛇': { summary: '腾蛇主虚惊怪异，多生是非口舌', meaning: '防虚惊，谨防谣言，事多变故' },
  '太阴': { summary: '太阴主阴德助人，暗中有贵人相助', meaning: '暗中有贵人，适合秘密行事，女性贵人助力' },
  '六合': { summary: '六合主和合美满，婚姻交易皆吉', meaning: '人际和谐，合作顺利，婚姻感情大吉' },
  '白虎': { summary: '白虎主血光刑伤，凶险之象', meaning: '防血光之灾，官司纠纷，出行有险' },
  '玄武': { summary: '玄武主盗贼暗昧，小人暗害', meaning: '防小人暗算，财物失窃，阴谋诡计' },
  '九地': { summary: '九地主坚固安稳，宜守不宜攻', meaning: '守成有利，稳固基础，不宜冒进' },
  '九天': { summary: '九天主飞扬跋扈，宜进取开拓', meaning: '进取有利，开拓新局，适合远行求财' },
}

// ─── 五行生克 ────────────────────────────────────────────────

const ELEM_GENERATE: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const ELEM_OVERCOME: Record<string, string>  = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

export function elemRelation(a: string, b: string): '生' | '克' | '被生' | '被克' | '同' {
  if (a === b) return '同'
  if (ELEM_GENERATE[a] === b) return '生'
  if (ELEM_OVERCOME[a] === b) return '克'
  if (ELEM_GENERATE[b] === a) return '被生'
  if (ELEM_OVERCOME[b] === a) return '被克'
  return '同'
}

// ─── 用神宫位 ────────────────────────────────────────────────

/** 不同问题类型的用神（主要关注的宫位/门/星） */
export const QUESTION_YONGSHEN: Record<string, { focus: string; desc: string }> = {
  '事业前程': { focus: '开门·生门·天辅·值符', desc: '以开门、生门为用神，天辅星辅助，值符贵人' },
  '财运投资': { focus: '生门·开门·天心·九天', desc: '以生门、开门为财门，天心星主财智，九天主进取' },
  '婚姻感情': { focus: '六合·休门·天任·太阴', desc: '以六合神为主，休门主安稳，天任主担当，太阴主阴缘' },
  '健康疾病': { focus: '天心·生门·休门·值符', desc: '以天心星主医疗，生门主生机，休门主休养' },
  '出行求谋': { focus: '开门·九天·天冲·值符', desc: '以开门主出行，九天主远行，天冲主冲劲' },
  '诉讼官非': { focus: '值符·开门·天辅·景门', desc: '以值符贵人为主，开门主胜诉，景门主文书' },
  '考试学业': { focus: '景门·天辅·六合·太阴', desc: '以景门主文事，天辅星主辅助，六合主和谐' },
  '其他问题': { focus: '值符·生门·天辅', desc: '以值符、生门为主要参考' },
}

// ─── 综合解读 ────────────────────────────────────────────────

export interface QimenInterpretation {
  overall: string        // 总体格局
  yongshen: string       // 用神分析
  mainPalace: PalaceInfo // 主要落宫
  gateAnalysis: string   // 八门解读
  starAnalysis: string   // 九星解读
  godAnalysis: string    // 八神解读
  fivePhase: string      // 五行生克
  suggestion: string     // 行动建议
  luckyDir: string       // 吉方
  luckyTime: string      // 吉时
  score: number          // 综合评分 0-100
}

// ─── 问题 × 门 × 星 × 神 组合解析 ──────────────────────────

/** 根据问题类型，从门/星/神中提取针对性解读文字 */
function getQuestionSpecificReading(
  question: string,
  gate: string,
  star: string,
  god: string,
  isGood: boolean,
): string {
  const gateD = GATE_DETAIL[gate]
  const starD = STAR_DETAIL[star]
  const godD  = GOD_DETAIL[god]

  // 门的问题专项解读
  const gateKey = ({
    '事业前程': 'career', '财运投资': 'wealth', '婚姻感情': 'love',
    '健康疾病': 'health', '出行求谋': 'travel', '诉讼官非': 'career',
    '考试学业': 'career', '其他问题': 'career',
  } as Record<string, keyof typeof gateD>)[question] || 'career'

  const gateReading = gateD ? (gateD[gateKey] || gateD.summary) : ''
  const starReading = starD?.meaning || ''
  const godReading  = godD?.meaning  || ''

  return `${gateReading}。${starReading}。${godReading}`
}

/** 生成五行生克的叙述性解析 */
function buildFivePhaseNarrative(
  star: string, starElem: string,
  gate: string, gateElem: string,
  rel: string,
  question: string,
): string {
  const relMap: Record<string, string> = {
    '生':   `${star}（${starElem}）生助${gate}（${gateElem}），星门相生，力量得到增益，对所问之事有推动作用`,
    '克':   `${star}（${starElem}）克制${gate}（${gateElem}），星克门，门的力量受到压制，行事阻力较大`,
    '被生': `${gate}（${gateElem}）反生${star}（${starElem}），门生星，门的能量向外输出，有利于主动出击`,
    '被克': `${gate}（${gateElem}）克制${star}（${starElem}），门克星，星力受损，需防内部消耗`,
    '同':   `星门同属${gateElem}行，力量平衡，不偏不倚，宜稳健行事`,
  }
  const base = relMap[rel] || `星门五行关系为${rel}`

  // 针对问题类型补充说明
  const supplement: Record<string, Record<string, string>> = {
    '生': {
      '事业前程': '，事业发展有助力，可积极推进',
      '财运投资': '，财路畅通，投资有利',
      '婚姻感情': '，感情有滋养，关系升温',
      '健康疾病': '，身体有生机，康复顺利',
      '出行求谋': '，出行顺利，求谋有成',
      '诉讼官非': '，官司有助力，胜诉可期',
      '考试学业': '，学业有进益，考试顺利',
    },
    '克': {
      '事业前程': '，事业推进受阻，需迂回应对',
      '财运投资': '，财运受压，投资需谨慎',
      '婚姻感情': '，感情有摩擦，需多包容',
      '健康疾病': '，病情有反复，需坚持调养',
      '出行求谋': '，出行有阻碍，求谋需耐心',
      '诉讼官非': '，官司不利，宜和解为上',
      '考试学业': '，学业有压力，需加倍努力',
    },
  }
  const extra = supplement[rel]?.[question] || ''
  return base + extra
}

/** 生成综合叙述性解析（核心函数） */
function buildNarrative(
  question: string,
  mainPalace: PalaceInfo,
  zhiFuPalace: PalaceInfo,
  yang: boolean,
  ju: number,
  score: number,
  fivePhase: string,
): string {
  const { gate, star, god, palaceName, direction, element, starElem } = mainPalace
  const gateD = GATE_DETAIL[gate]
  const starD = STAR_DETAIL[star]
  const godD  = GOD_DETAIL[god]
  const isGood = score >= 65
  const isGreat = score >= 80
  const isBad = score < 50

  // 第一段：局势总述
  const p1 = `此局为${yang ? '阳' : '阴'}遁${ju}局，${yang ? '阳遁顺布，生气旺盛' : '阴遁逆布，收敛内守'}。`
    + `问事落宫于${palaceName}（${direction}），`
    + `${gate ? gate + '当令，' : ''}${star}照临，${god}护持，`
    + `综合格局${isGreat ? '大吉，诸事顺遂' : isGood ? '吉利，可顺势而为' : isBad ? '偏凶，需谨慎应对' : '平平，宜稳健行事'}。`

  // 第二段：门的解析
  const gateKey = ({
    '事业前程': 'career', '财运投资': 'wealth', '婚姻感情': 'love',
    '健康疾病': 'health', '出行求谋': 'travel', '诉讼官非': 'career',
    '考试学业': 'career', '其他问题': 'career',
  } as Record<string, keyof typeof gateD>)[question] || 'career'
  const gateReading = gateD ? (gateD[gateKey] || gateD.summary) : ''
  const p2 = gate
    ? `【八门】${gate}属${element}，${gateD?.summary || ''}。就${question}而言：${gateReading}。`
    : `【落宫】中宫无门，主事情居中，需借助其他宫位力量。`

  // 第三段：星的解析
  const p3 = `【九星】${star}（${starElem}行）照临此宫，${starD?.summary || ''}。${starD?.meaning || ''}。`
    + (starElem !== element
      ? `星宫五行：${fivePhase}。`
      : `星宫同属${element}行，力量协调。`)

  // 第四段：神的解析
  const p4 = `【八神】${god}当值，${godD?.summary || ''}。${godD?.meaning || ''}。`
    + (god === '值符' ? '值符为贵人之神，此局贵人助力明显。' : '')
    + (god === '六合' ? '六合主和合，人际关系顺畅，合作有利。' : '')
    + (god === '白虎' || god === '玄武' ? '需特别防范小人与意外。' : '')

  // 第五段：值符宫辅助分析
  const zhiFuGateD = GATE_DETAIL[zhiFuPalace.gate]
  const p5 = zhiFuPalace.palaceNum !== mainPalace.palaceNum
    ? `值符落于${zhiFuPalace.palaceName}（${zhiFuPalace.direction}），`
      + `${zhiFuPalace.gate ? zhiFuPalace.gate + '开路，' : ''}${zhiFuPalace.god}护佑，`
      + `贵人在${zhiFuPalace.direction}方，可借助${zhiFuPalace.direction}方之力。`
    : `值符与用神同宫，贵人与所问之事高度契合，力量集中。`

  return [p1, p2, p3, p4, p5].join('\n\n')
}

/**
 * 根据问题类型，在盘面中找对应的用神宫位
 * 奇门遁甲用神取法：
 *   事业前程 → 开门所在宫（无则取生门）
 *   财运投资 → 生门所在宫（无则取开门）
 *   婚姻感情 → 六合神所在宫
 *   健康疾病 → 天心星所在宫（无则取生门）
 *   出行求谋 → 开门所在宫（无则取九天神）
 *   诉讼官非 → 值符神所在宫（即 zhiFu）
 *   考试学业 → 景门所在宫（无则取天辅星）
 *   其他问题 → 值使宫（zhiShi）
 */
function findYongshenPalace(palaces: PalaceInfo[], question: string, zhiFu: number, zhiShi: number): PalaceInfo {
  const find = (pred: (p: PalaceInfo) => boolean) => palaces.find(pred)

  let palace: PalaceInfo | undefined

  switch (question) {
    case '事业前程':
      palace = find(p => p.gate === '开门') ?? find(p => p.gate === '生门')
      break
    case '财运投资':
      palace = find(p => p.gate === '生门') ?? find(p => p.gate === '开门')
      break
    case '婚姻感情':
      palace = find(p => p.god === '六合') ?? find(p => p.gate === '休门')
      break
    case '健康疾病':
      palace = find(p => p.star === '天心') ?? find(p => p.gate === '生门')
      break
    case '出行求谋':
      palace = find(p => p.gate === '开门') ?? find(p => p.god === '九天')
      break
    case '诉讼官非':
      palace = palaces[zhiFu - 1]
      break
    case '考试学业':
      palace = find(p => p.gate === '景门') ?? find(p => p.star === '天辅')
      break
    default:
      palace = palaces[Math.min(zhiShi - 1, 8)]
  }

  // 兜底：找不到就用值使宫
  return palace ?? palaces[Math.min(zhiShi - 1, 8)] ?? palaces[zhiFu - 1]
}

export function interpretChart(chart: QimenChart, question: string): QimenInterpretation {
  const { palaces, yang, ju, zhiFu, zhiShi } = chart

  const zhiFuPalace = palaces[zhiFu - 1]
  // 根据问题类型动态选取用神宫
  const mainPalace  = findYongshenPalace(palaces, question, zhiFu, zhiShi)

  // ── 评分 ──
  let score = 50
  const gateN = GATE_NATURE[mainPalace.gate] || '中'
  const starN = STAR_NATURE[mainPalace.star] || '中'
  const godN  = GOD_NATURE[mainPalace.god]  || '中'

  if (gateN === '大吉') score += 20
  else if (gateN === '吉') score += 12
  else if (gateN === '中吉') score += 8
  else if (gateN === '凶') score -= 12
  else if (gateN === '大凶') score -= 20

  if (starN === '大吉' || starN === '吉') score += 10
  else if (starN === '凶') score -= 10

  if (godN === '大吉') score += 15
  else if (godN === '吉') score += 8
  else if (godN === '凶') score -= 10

  if (yang) score += 3
  score = Math.max(20, Math.min(95, score))

  // ── 五行生克 ──
  const gateElem = mainPalace.element
  const starElem = mainPalace.starElem
  const rel = elemRelation(starElem, gateElem)
  const fivePhase = buildFivePhaseNarrative(
    mainPalace.star, starElem,
    mainPalace.gate, gateElem,
    rel, question,
  )

  // ── 吉方吉时 ──
  const luckyDir = zhiFuPalace.direction + '方'
  const luckyHours = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
  const luckyTime = luckyHours[(ju * 2) % 12] + '、' + luckyHours[(ju * 2 + 6) % 12]

  // ── 用神 ──
  const yongshenInfo = QUESTION_YONGSHEN[question] || QUESTION_YONGSHEN['其他问题']
  const yongshenText = `用神：${yongshenInfo.focus}\n${yongshenInfo.desc}\n落宫：${mainPalace.palaceName}（${mainPalace.direction}）`

  // ── 综合叙述性解析 ──
  const overall = buildNarrative(question, mainPalace, zhiFuPalace, yang, ju, score, fivePhase)

  // ── 门/星/神 独立解读（供盘面 Tab 点击查看） ──
  const gateD = GATE_DETAIL[mainPalace.gate]
  const starD = STAR_DETAIL[mainPalace.star]
  const godD  = GOD_DETAIL[mainPalace.god]
  const gateKey = ({
    '事业前程': 'career', '财运投资': 'wealth', '婚姻感情': 'love',
    '健康疾病': 'health', '出行求谋': 'travel', '诉讼官非': 'career',
    '考试学业': 'career', '其他问题': 'career',
  } as Record<string, keyof typeof gateD>)[question] || 'career'

  const gateAnalysis = mainPalace.gate
    ? `${mainPalace.gate}（${gateN}）\n${gateD?.summary || ''}\n\n针对「${question}」：${gateD ? gateD[gateKey] || gateD.summary : ''}`
    : '中宫无门，以星神为主要参考'
  const starAnalysis = `${mainPalace.star}（${starN}）\n${starD?.summary || ''}\n\n${starD?.meaning || ''}`
  const godAnalysis  = `${mainPalace.god}（${godN}）\n${godD?.summary || ''}\n\n${godD?.meaning || ''}`

  // ── 行动建议 ──
  const isGood = score >= 65
  const godD2 = GOD_DETAIL[mainPalace.god]
  const suggGood = [
    `${mainPalace.god}护佑，${mainPalace.gate || mainPalace.star}开路，宜把握${luckyDir}之机，于${luckyTime}积极行动，必有所成。`,
    `顺应${yang ? '阳' : '阴'}遁${ju}局之势，${mainPalace.star}照临，贵人在${zhiFuPalace.direction}方，可主动出击，大胆进取。`,
    `此局${mainPalace.gate || ''}与${mainPalace.star}相合，${fivePhase.split('，')[0]}，宜在${luckyTime}前后行动，方向取${luckyDir}。`,
  ]
  const suggBad = [
    `此局${mainPalace.gate || mainPalace.star}不利，${godD2?.meaning || '需防阻碍'}，宜暂缓行动，待${luckyTime}时机转好，再图进取。`,
    `${mainPalace.god}当值，${mainPalace.star}照临，格局偏凶，建议转向${luckyDir}寻求突破，切勿强行推进。`,
    `宜守成待时，${fivePhase.split('，')[0]}，力量受制，此时行动事倍功半，不如蓄势待发。`,
  ]
  const suggList = isGood ? suggGood : suggBad
  const suggestion = suggList[ju % suggList.length]

  return {
    overall,
    yongshen: yongshenText,
    mainPalace,
    gateAnalysis,
    starAnalysis,
    godAnalysis,
    fivePhase,
    suggestion,
    luckyDir,
    luckyTime,
    score,
  }
}
