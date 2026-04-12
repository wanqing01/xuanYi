import { useState, useMemo } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import { hexagrams } from '../../lib/fortune-data'
import './index.scss'

// ── 八卦基础数据 ──────────────────────────────────────────────
// 后天八卦序：坎1 坤2 震3 巽4 中5 乾6 兑7 艮8 离9
// 梅花易数用先天八卦数：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8
const TRIGRAM_NAMES = ['', '乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const TRIGRAM_SYMBOLS = ['', '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']
const TRIGRAM_NATURE = ['', '天', '泽', '火', '雷', '风', '水', '山', '地']
const TRIGRAM_ELEMENT = ['', '金', '金', '火', '木', '木', '水', '土', '土']

// 先天八卦 → 后天八卦对应的六十四卦查找
// 上卦(先天1-8) × 下卦(先天1-8) → 卦名
// 先天：乾1兑2离3震4巽5坎6艮7坤8
// 后天对应：乾=乾 兑=兑 离=离 震=震 巽=巽 坎=坎 艮=艮 坤=坤
const HEXAGRAM_MAP: Record<string, string> = {
  // 上乾(1)
  '1-1':'乾','1-2':'履','1-3':'同人','1-4':'无妄','1-5':'姤','1-6':'讼','1-7':'遁','1-8':'否',
  // 上兑(2)
  '2-1':'夬','2-2':'兑','2-3':'革','2-4':'随','2-5':'大过','2-6':'困','2-7':'咸','2-8':'萃',
  // 上离(3)
  '3-1':'大有','3-2':'睽','3-3':'离','3-4':'噬嗑','3-5':'鼎','3-6':'未济','3-7':'旅','3-8':'晋',
  // 上震(4)
  '4-1':'大壮','4-2':'归妹','4-3':'丰','4-4':'震','4-5':'恒','4-6':'解','4-7':'小过','4-8':'豫',
  // 上巽(5)
  '5-1':'小畜','5-2':'中孚','5-3':'家人','5-4':'益','5-5':'巽','5-6':'涣','5-7':'渐','5-8':'观',
  // 上坎(6)
  '6-1':'需','6-2':'节','6-3':'既济','6-4':'屯','6-5':'井','6-6':'坎','6-7':'蹇','6-8':'比',
  // 上艮(7)
  '7-1':'大畜','7-2':'损','7-3':'贲','7-4':'颐','7-5':'蛊','7-6':'蒙','7-7':'艮','7-8':'剥',
  // 上坤(8)
  '8-1':'泰','8-2':'临','8-3':'明夷','8-4':'复','8-5':'升','8-6':'师','8-7':'谦','8-8':'坤',
}

// 动爻对应的爻位名称
const YAO_NAMES = ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

// 变卦：将本卦的动爻阴阳互换得到变卦
function getChangedTrigram(upper: number, lower: number, yao: number): { upper: number; lower: number } {
  // 爻位1-6，1-3在下卦，4-6在上卦
  // 先天八卦阴阳互换：乾1↔坤8 兑2↔艮7 离3↔坎6 震4↔巽5
  const flip: Record<number, number> = { 1:8, 8:1, 2:7, 7:2, 3:6, 6:3, 4:5, 5:4 }
  if (yao <= 3) {
    return { upper, lower: flip[lower] ?? lower }
  } else {
    return { upper: flip[upper] ?? upper, lower }
  }
}

// 互卦：取本卦2-4爻为下互卦，3-5爻为上互卦
// 简化：互卦上卦=本卦3-5爻，互卦下卦=本卦2-4爻
// 用先天数近似：上互=下卦+1循环，下互=上卦-1循环（简化版）
function getMutualTrigram(upper: number, lower: number): { upper: number; lower: number } {
  const mu = ((upper) % 8) + 1
  const ml = ((lower) % 8) + 1
  return { upper: mu, lower: ml }
}

function getHexagramName(upper: number, lower: number): string {
  return HEXAGRAM_MAP[`${upper}-${lower}`] ?? '未知'
}

function findHexagram(name: string) {
  return hexagrams.find(h => h.name === name) ?? hexagrams[0]
}

// 农历年数（简化：取年份后两位）
function getLunarYearNum(year: number): number {
  return year % 100 || 100
}

// 时辰数（子=1...亥=12）
const HOUR_LABELS = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
function getShichen(hour: number): number {
  return Math.floor(hour / 2) + 1
}

type Method = 'time' | 'number'
type Step = 'select' | 'input' | 'result'

interface MeihuaResult {
  method: string
  mainUpper: number; mainLower: number; yao: number
  mainName: string; changeName: string; mutualName: string
  mainHex: typeof hexagrams[0]
  changeHex: typeof hexagrams[0]
  mutualHex: typeof hexagrams[0]
  yaoName: string
  analysis: string
}

export default function MeihuaPage() {
  const [step, setStep] = useState<Step>('select')
  const [method, setMethod] = useState<Method>('time')
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [result, setResult] = useState<MeihuaResult | null>(null)
  const [activeTab, setActiveTab] = useState<'main' | 'change' | 'mutual'>('main')

  const now = useMemo(() => new Date(), [])

  // 时间起卦
  const castByTime = () => {
    const year  = getLunarYearNum(now.getFullYear())
    const month = now.getMonth() + 1
    const day   = now.getDate()
    const shi   = getShichen(now.getHours())

    const upperVal = ((year + month + day) % 8) || 8
    const lowerVal = ((year + month + day + shi) % 8) || 8
    const yao      = ((year + month + day + shi) % 6) || 6

    buildResult('时间起卦', upperVal, lowerVal, yao)
  }

  // 数字起卦
  const castByNumber = () => {
    const n1 = parseInt(num1) || 0
    const n2 = parseInt(num2) || 0
    if (!n1 || !n2) return

    const upperVal = (n1 % 8) || 8
    const lowerVal = (n2 % 8) || 8
    const yao      = ((n1 + n2) % 6) || 6

    buildResult('数字起卦', upperVal, lowerVal, yao)
  }

  const buildResult = (methodName: string, upper: number, lower: number, yao: number) => {
    const mainName   = getHexagramName(upper, lower)
    const { upper: cu, lower: cl } = getChangedTrigram(upper, lower, yao)
    const { upper: mu, lower: ml } = getMutualTrigram(upper, lower)
    const changeName  = getHexagramName(cu, cl)
    const mutualName  = getHexagramName(mu, ml)

    const mainHex   = findHexagram(mainName)
    const changeHex = findHexagram(changeName)
    const mutualHex = findHexagram(mutualName)

    // 综合解读：三卦关系总结，每卦用不同维度描述
    const mainGood   = mainHex.fortune.includes('吉')
    const changeGood = changeHex.fortune.includes('吉')
    const trend = mainGood && changeGood ? '整体走势向好'
      : !mainGood && !changeGood ? '整体形势较为严峻'
      : mainGood ? '当前虽好，需防后续变化'
      : '当前有阻，但结果趋于好转'

    const analysis = `【本卦·${mainName}】${mainHex.fortune}——${mainHex.advice}\n\n`
      + `【互卦·${mutualName}】${mutualHex.fortune}——事情发展过程中，${mutualHex.advice}\n\n`
      + `【变卦·${changeName}】${changeHex.fortune}——最终走向：${changeHex.advice}\n\n`
      + `综合来看，${trend}。动爻在${YAO_NAMES[yao]}，此爻为事情变化的关键节点，宜重点关注。`

    setResult({
      method: methodName,
      mainUpper: upper, mainLower: lower, yao,
      mainName, changeName, mutualName,
      mainHex, changeHex, mutualHex,
      yaoName: YAO_NAMES[yao],
      analysis,
    })
    setStep('result')
    setActiveTab('main')
  }

  const reset = () => {
    setStep('select')
    setResult(null)
    setNum1('')
    setNum2('')
  }

  const getFortuneClass = (fortune: string) => {
    if (fortune.includes('大吉')) return 'tag-great'
    if (fortune.includes('吉')) return 'tag-good'
    if (fortune.includes('凶')) return 'tag-bad'
    return 'tag-neutral'
  }

  const renderTrigramInfo = (upper: number, lower: number, name: string) => (
    <View className='trigram-display'>
      <View className='trigram-col'>
        <Text className='trigram-sym'>{TRIGRAM_SYMBOLS[upper]}</Text>
        <Text className='trigram-nm'>{TRIGRAM_NAMES[upper]}</Text>
        <Text className='trigram-nat'>{TRIGRAM_NATURE[upper]}</Text>
      </View>
      <View className='trigram-center'>
        <Text className='hex-name'>{name}卦</Text>
      </View>
      <View className='trigram-col'>
        <Text className='trigram-sym'>{TRIGRAM_SYMBOLS[lower]}</Text>
        <Text className='trigram-nm'>{TRIGRAM_NAMES[lower]}</Text>
        <Text className='trigram-nat'>{TRIGRAM_NATURE[lower]}</Text>
      </View>
    </View>
  )

  return (
    <View className='meihua-page'>
      <View className='page-header'>
        <Text className='page-title'>梅花易数</Text>
        <Text className='page-subtitle'>以象取义 · 本卦互卦变卦</Text>
      </View>

      {/* 选择起卦方式 */}
      {step === 'select' && (
        <View className='select-area'>
          <Text className='select-hint'>选择起卦方式</Text>
          <View className='method-cards'>
            <View className='method-card' onClick={() => { setMethod('time'); castByTime() }}>
              <Text className='method-icon'>⏰</Text>
              <Text className='method-title'>时间起卦</Text>
              <Text className='method-desc'>以当前年月日时自动起卦，最为便捷</Text>
              <View className='method-time'>
                <Text>{now.getFullYear()}年{now.getMonth()+1}月{now.getDate()}日</Text>
                <Text>{HOUR_LABELS[Math.floor(now.getHours()/2)]}时</Text>
              </View>
            </View>
            <View className='method-card' onClick={() => { setMethod('number'); setStep('input') }}>
              <Text className='method-icon'>🔢</Text>
              <Text className='method-title'>数字起卦</Text>
              <Text className='method-desc'>心中默想问题，随意说出两个数字起卦</Text>
              <Text className='method-sub'>灵感数字 · 随心而起</Text>
            </View>
          </View>
        </View>
      )}

      {/* 数字输入 */}
      {step === 'input' && (
        <View className='input-area'>
          <Text className='input-title'>数字起卦</Text>
          <Text className='input-hint'>静心默想所问之事{'\n'}随意说出两个数字</Text>
          <View className='number-inputs'>
            <View className='num-input-wrap'>
              <Text className='num-label'>第一个数字</Text>
              <View className='num-input-box'>
                <Input
                  className='num-input'
                  type='number'
                  placeholder='请输入'
                  placeholderStyle='color:#4b5563;font-size:32rpx'
                  value={num1}
                  onInput={e => setNum1(e.detail.value)}
                />
              </View>
            </View>
            <View className='num-input-wrap'>
              <Text className='num-label'>第二个数字</Text>
              <View className='num-input-box'>
                <Input
                  className='num-input'
                  type='number'
                  placeholder='请输入'
                  placeholderStyle='color:#4b5563;font-size:32rpx'
                  value={num2}
                  onInput={e => setNum2(e.detail.value)}
                />
              </View>
            </View>
          </View>
          <Button className='btn-primary' onClick={castByNumber}>起卦</Button>
          <Button className='btn-ghost' onClick={() => setStep('select')}>返回</Button>
        </View>
      )}

      {/* 结果 */}
      {step === 'result' && result && (
        <View className='result-area'>
          {/* 起卦信息 */}
          <View className='result-meta'>
            <Text className='meta-method'>{result.method}</Text>
            <Text className='meta-yao'>动爻：{result.yaoName}</Text>
          </View>

          {/* 三卦 Tab */}
          <View className='tab-bar'>
            {[
              { key: 'main' as const, label: '本卦', sub: result.mainName },
              { key: 'mutual' as const, label: '互卦', sub: result.mutualName },
              { key: 'change' as const, label: '变卦', sub: result.changeName },
            ].map(t => (
              <View key={t.key} className={`tab-item ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
                <Text className='tab-label'>{t.label}</Text>
                <Text className='tab-sub'>{t.sub}</Text>
              </View>
            ))}
          </View>

          {/* 卦象详情 */}
          {(() => {
            const isMain   = activeTab === 'main'
            const isMutual = activeTab === 'mutual'
            const upper = isMain ? result.mainUpper : isMutual
              ? ((result.mainUpper) % 8) + 1
              : getChangedTrigram(result.mainUpper, result.mainLower, result.yao).upper
            const lower = isMain ? result.mainLower : isMutual
              ? ((result.mainLower) % 8) + 1
              : getChangedTrigram(result.mainUpper, result.mainLower, result.yao).lower
            const hex = isMain ? result.mainHex : isMutual ? result.mutualHex : result.changeHex
            const name = isMain ? result.mainName : isMutual ? result.mutualName : result.changeName

            return (
              <View className='hex-detail'>
                {renderTrigramInfo(upper, lower, name)}

                <View className={`fortune-tag ${getFortuneClass(hex.fortune)}`}>
                  <Text>{hex.fortune}</Text>
                </View>

                <View className='hex-sections'>
                  <View className='hex-section'>
                    <Text className='section-label'>卦辞</Text>
                    <Text className='section-quote'>「{hex.meaning}」</Text>
                  </View>
                  <View className='hex-section'>
                    <Text className='section-label'>卦象解析</Text>
                    <Text className='section-body'>{(hex as any).description ?? hex.meaning}</Text>
                  </View>
                  <View className='hex-dims'>
                    {[
                      { icon: '♡', label: '感情', text: (hex as any).love },
                      { icon: '◆', label: '事业', text: (hex as any).career },
                      { icon: '◈', label: '财运', text: (hex as any).wealth },
                      { icon: '❖', label: '健康', text: (hex as any).health },
                    ].filter(d => d.text).map(d => (
                      <View key={d.label} className='dim-item'>
                        <View className='dim-header'>
                          <Text className='dim-icon'>{d.icon}</Text>
                          <Text className='dim-label'>{d.label}</Text>
                        </View>
                        <Text className='dim-text'>{d.text}</Text>
                      </View>
                    ))}
                  </View>
                  <View className='advice-box'>
                    <Text className='advice-label'>▸ 建议</Text>
                    <Text className='advice-text'>{hex.advice}</Text>
                  </View>
                </View>
              </View>
            )
          })()}

          {/* 综合解读 */}
          <View className='analysis-card'>
            <Text className='analysis-title'>综合解读</Text>
            <Text className='analysis-body'>{result.analysis}</Text>
          </View>

          <Button className='btn-primary' onClick={reset}>重新起卦</Button>
        </View>
      )}
    </View>
  )
}
