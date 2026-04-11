/**
 * 奇门遁甲排盘引擎
 * 基于时家奇门，支持阳遁/阴遁，实现九宫飞布
 */

// ─── 基础常量 ───────────────────────────────────────────────

/** 九宫洛书序（1-9），对应方位：坎1 坤2 震3 巽4 中5 乾6 兑7 艮8 离9 */
export const PALACE_NAMES = ['', '坎宫', '坤宫', '震宫', '巽宫', '中宫', '乾宫', '兑宫', '艮宫', '离宫']
export const PALACE_DIRS  = ['', '北',   '西南', '东',   '东南', '中',   '西北', '西',   '东北', '南']
export const PALACE_ELEM  = ['', '水',   '土',   '木',   '木',   '土',   '金',   '金',   '土',   '火']

/** 八门（按洛书宫位1-8，中宫无门） */
export const GATES = ['', '休门', '死门', '伤门', '杜门', '开门', '惊门', '生门', '景门']
// 对应宫位：1坎=休 2坤=死 3震=伤 4巽=杜 6乾=开 7兑=惊 8艮=生 9离=景

/** 九星（按洛书宫位1-9） */
export const STARS = ['', '天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英']

/** 八神（顺序：值符 腾蛇 太阴 六合 白虎 玄武 九地 九天） */
export const GODS = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

/** 十天干 */
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/** 十二地支 */
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 三奇六仪（地盘天干，按阳遁顺序） */
export const SIX_YI_THREE_QI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']
// 六仪：戊己庚辛壬癸  三奇：丁丙乙

/** 八门吉凶 */
export const GATE_NATURE: Record<string, string> = {
  '休门': '吉', '生门': '大吉', '开门': '大吉',
  '伤门': '凶', '杜门': '中', '景门': '中吉',
  '死门': '大凶', '惊门': '凶',
}

/** 九星吉凶 */
export const STAR_NATURE: Record<string, string> = {
  '天蓬': '凶', '天芮': '凶', '天冲': '吉', '天辅': '大吉',
  '天禽': '中', '天心': '吉', '天柱': '凶', '天任': '吉', '天英': '凶',
}

/** 八神吉凶 */
export const GOD_NATURE: Record<string, string> = {
  '值符': '大吉', '腾蛇': '凶', '太阴': '吉', '六合': '吉',
  '白虎': '凶', '玄武': '凶', '九地': '吉', '九天': '吉',
}

/** 九星五行 */
export const STAR_ELEM: Record<string, string> = {
  '天蓬': '水', '天芮': '土', '天冲': '木', '天辅': '木',
  '天禽': '土', '天心': '金', '天柱': '金', '天任': '土', '天英': '火',
}

// ─── 时间转换 ────────────────────────────────────────────────

/** 获取干支纪年（简化：以1984甲子年为基准） */
export function getYearGanzhi(year: number): { stem: string; branch: string; index: number } {
  const base = 1984 // 甲子年
  const diff = ((year - base) % 60 + 60) % 60
  return {
    stem: STEMS[diff % 10],
    branch: BRANCHES[diff % 12],
    index: diff,
  }
}

/** 获取月份干支（简化版，以节气为准的近似） */
export function getMonthGanzhi(year: number, month: number): { stem: string; branch: string } {
  // 月支：寅月=1月，以此类推
  const branchIdx = (month + 1) % 12
  // 月干：根据年干推算（五虎遁年起月法）
  const yearStemIdx = ((year - 1984) % 10 + 10) % 10
  const monthStemBase = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIdx]
  const stemIdx = (monthStemBase + month - 1) % 10
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx] }
}

/** 获取日干支（以2000年1月1日甲午日为基准） */
export function getDayGanzhi(date: Date): { stem: string; branch: string; index: number } {
  const base = new Date(2000, 0, 1) // 甲午日，index=30
  const baseIndex = 30
  const diff = Math.floor((date.getTime() - base.getTime()) / 86400000)
  const idx = ((diff + baseIndex) % 60 + 60) % 60
  return {
    stem: STEMS[idx % 10],
    branch: BRANCHES[idx % 12],
    index: idx,
  }
}

/** 获取时干支 */
export function getHourGanzhi(date: Date): { stem: string; branch: string; branchIdx: number } {
  const hour = date.getHours()
  // 时支：子时=0，丑时=1...
  const branchIdx = hour < 1 ? 0 : Math.floor((hour + 1) / 2) % 12
  // 时干：五鼠遁日起时法
  const dayStemIdx = getDayGanzhi(date).index % 10
  const hourStemBase = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][dayStemIdx]
  const stemIdx = (hourStemBase + branchIdx) % 10
  return { stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], branchIdx }
}

// ─── 局数计算 ────────────────────────────────────────────────

/**
 * 判断阳遁/阴遁及局数（时家奇门，1-9局）
 * 简化算法：根据节气和时辰推算
 */
export function getJuInfo(date: Date): { yang: boolean; ju: number; juName: string } {
  const month = date.getMonth() + 1
  const hour = date.getHours()
  const dayIdx = getDayGanzhi(date).index

  // 冬至到夏至为阳遁，夏至到冬至为阴遁（简化以月份判断）
  const yang = month >= 12 || month <= 5

  // 局数：根据日干支的旬首推算（简化：用日干支index mod 9 + 1）
  // 真实算法需要超接置闰，此处用近似值
  const juBase = Math.floor(dayIdx / 10) % 9
  const hourOffset = Math.floor(hour / 2) % 3
  let ju = ((juBase + hourOffset) % 9) + 1

  return { yang, ju, juName: `${yang ? '阳' : '阴'}遁${ju}局` }
}

// ─── 九宫飞布 ────────────────────────────────────────────────

/**
 * 洛书九宫飞布
 * 阳遁顺飞（1→2→3...→9→1），阴遁逆飞（9→8→7...→1→9）
 * 返回：palace[i] = 宫位1-9 对应的星/门/神索引
 */
export function flyPalaces(startPalace: number, yang: boolean): number[] {
  // 洛书顺序：1坎 2坤 3震 4巽 5中 6乾 7兑 8艮 9离
  const result: number[] = new Array(10).fill(0)
  for (let i = 1; i <= 9; i++) {
    let palace: number
    if (yang) {
      palace = ((startPalace - 1 + i - 1) % 9) + 1
    } else {
      palace = ((startPalace - 1 - (i - 1) + 90) % 9) + 1
    }
    result[palace] = i
  }
  return result
}

// ─── 完整盘面 ────────────────────────────────────────────────

export interface PalaceInfo {
  palaceNum: number   // 宫位 1-9
  palaceName: string  // 坎宫等
  direction: string   // 方位
  element: string     // 五行
  stem: string        // 天干（地盘）
  star: string        // 九星
  gate: string        // 八门（中宫无门）
  god: string         // 八神
  starNature: string
  gateNature: string
  godNature: string
  starElem: string
  isCenter: boolean
}

export interface QimenChart {
  yang: boolean
  ju: number
  juName: string
  yearGz: string
  monthGz: string
  dayGz: string
  hourGz: string
  palaces: PalaceInfo[]  // 9个宫，index 0-8 对应宫位1-9
  zhiFu: number          // 值符所在宫位
  zhiShi: number         // 值使（值符门）所在宫位
}

/**
 * 起奇门遁甲局
 */
export function castQimenChart(date: Date): QimenChart {
  const { yang, ju, juName } = getJuInfo(date)
  const yearGz = getYearGanzhi(date.getFullYear())
  const monthGz = getMonthGanzhi(date.getFullYear(), date.getMonth() + 1)
  const dayGz = getDayGanzhi(date)
  const hourGz = getHourGanzhi(date)

  // 值符：时干对应的九星所在宫位
  // 时干甲=戊宫（中5），乙=己，丙=庚，丁=辛，戊=壬，己=癸，庚=丁，辛=丙，壬=乙，癸=甲
  // 简化：时干index决定值符星
  const hourStemIdx = STEMS.indexOf(hourGz.stem)
  // 值符星：按时干对应（甲戊同宫，乙己同宫...）
  const zhiFuStarIdx = [5, 2, 6, 7, 1, 2, 3, 4, 8, 9][hourStemIdx] // 对应九星宫位
  const zhiFuPalace = zhiFuStarIdx

  // 九星飞布：以值符星所在宫为起点
  const starFly = flyPalaces(zhiFuPalace, yang)
  // starFly[palace] = 星序(1-9)

  // 八门飞布：值使门（时支对应的门）
  const hourBranchIdx = hourGz.branchIdx
  // 时支对应门：子=休 丑=死 寅=伤 卯=杜 辰=景 巳=死 午=景 未=死 申=惊 酉=开 戌=休 亥=生（简化）
  const branchToGate = [1, 2, 3, 4, 9, 2, 9, 2, 6, 5, 1, 7] // 对应GATES索引
  const zhiShiGateIdx = branchToGate[hourBranchIdx]
  // 值使门所在宫位（门固定在地盘宫位，阳遁从1顺，阴遁从9逆）
  const zhiShiPalace = yang
    ? ((zhiShiGateIdx - 1 + ju - 1) % 8) + 1
    : ((9 - zhiShiGateIdx + ju) % 8) + 1

  // 八神飞布：值符神（值符）从值符宫起
  const godFly = flyPalaces(zhiFuPalace, yang)

  // 地盘天干：三奇六仪按局数排布
  // 阳遁：戊在坎1，按顺序飞布；阴遁：戊在离9，逆序
  const stemStartPalace = yang ? 1 : 9
  const stemFly = flyPalaces(stemStartPalace, yang)

  // 组装九宫
  const palaces: PalaceInfo[] = []
  for (let p = 1; p <= 9; p++) {
    const starSeq = starFly[p]  // 1-9
    const starName = STARS[starSeq] || '天禽'
    const gateName = p === 5 ? '' : (GATES[p] || '')
    const godSeq = ((godFly[p] - 1) % 8)
    const godName = GODS[godSeq] || GODS[0]
    const stemSeq = ((stemFly[p] - 1) % 9)
    const stemName = SIX_YI_THREE_QI[stemSeq] || '戊'

    palaces.push({
      palaceNum: p,
      palaceName: PALACE_NAMES[p],
      direction: PALACE_DIRS[p],
      element: PALACE_ELEM[p],
      stem: stemName,
      star: starName,
      gate: gateName,
      god: godName,
      starNature: STAR_NATURE[starName] || '中',
      gateNature: GATE_NATURE[gateName] || '中',
      godNature: GOD_NATURE[godName] || '中',
      starElem: STAR_ELEM[starName] || '土',
      isCenter: p === 5,
    })
  }

  return {
    yang, ju, juName,
    yearGz: yearGz.stem + yearGz.branch,
    monthGz: monthGz.stem + monthGz.branch,
    dayGz: dayGz.stem + dayGz.branch,
    hourGz: hourGz.stem + hourGz.branch,
    palaces,
    zhiFu: zhiFuPalace,
    zhiShi: zhiShiPalace,
  }
}
