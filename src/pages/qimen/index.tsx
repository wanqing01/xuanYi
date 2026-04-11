import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { castQimenChart } from '../../lib/qimen-engine'
import { interpretChart } from '../../lib/qimen-interpret'
import type { QimenChart } from '../../lib/qimen-engine'
import type { QimenInterpretation } from '../../lib/qimen-interpret'
import './index.scss'

const QUESTIONS = [
  { label: '事业前程', icon: '◇' },
  { label: '财运投资', icon: '◈' },
  { label: '婚姻感情', icon: '♡' },
  { label: '健康疾病', icon: '❖' },
  { label: '出行求谋', icon: '✦' },
  { label: '诉讼官非', icon: '⚖' },
  { label: '考试学业', icon: '📚' },
  { label: '其他问题', icon: '✧' },
]

// 九宫展示顺序（3×3，从左上到右下）：巽4 离9 坤2 / 震3 中5 兑7 / 艮8 坎1 乾6
const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6]

type Step = 'input' | 'question' | 'calculating' | 'result'

export default function QimenPage() {
  const [step, setStep] = useState<Step>('input')
  const [question, setQuestion] = useState('')
  const [chart, setChart] = useState<QimenChart | null>(null)
  const [interp, setInterp] = useState<QimenInterpretation | null>(null)
  const [activeTab, setActiveTab] = useState<'board' | 'detail'>('board')

  // 当前时间信息
  const now = useMemo(() => new Date(), [])
  const currentChart = useMemo(() => castQimenChart(now), [now])

  const handleSelectQuestion = (q: string) => {
    setQuestion(q)
    setStep('calculating')
    setTimeout(() => {
      const c = castQimenChart(new Date())
      const i = interpretChart(c, q)
      setChart(c)
      setInterp(i)
      setStep('result')
    }, 2000)
  }

  const reset = () => {
    setStep('input')
    setQuestion('')
    setChart(null)
    setInterp(null)
    setActiveTab('board')
  }

  const getNatureClass = (nature: string) => {
    if (nature.includes('大吉')) return 'great'
    if (nature.includes('吉')) return 'good'
    if (nature.includes('大凶')) return 'very-bad'
    if (nature.includes('凶')) return 'bad'
    return 'neutral'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80'
    if (score >= 65) return '#a78bfa'
    if (score >= 45) return '#facc15'
    return '#f87171'
  }

  return (
    <View className='qimen-page'>
      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>奇门遁甲</Text>
        <Text className='page-subtitle'>{currentChart.juName} · {currentChart.hourGz}时</Text>
      </View>

      {/* Step 1: 时间信息展示 + 进入问题选择 */}
      {step === 'input' && (
        <View className='input-area'>
          <View className='time-card'>
            <Text className='time-card-title'>当前时间信息</Text>
            <View className='time-grid'>
              <View className='time-item'>
                <Text className='time-label'>年柱</Text>
                <Text className='time-value'>{currentChart.yearGz}</Text>
              </View>
              <View className='time-item'>
                <Text className='time-label'>月柱</Text>
                <Text className='time-value'>{currentChart.monthGz}</Text>
              </View>
              <View className='time-item'>
                <Text className='time-label'>日柱</Text>
                <Text className='time-value'>{currentChart.dayGz}</Text>
              </View>
              <View className='time-item'>
                <Text className='time-label'>时柱</Text>
                <Text className='time-value'>{currentChart.hourGz}</Text>
              </View>
            </View>
            <View className='ju-badge'>
              <Text className='ju-text'>{currentChart.juName}</Text>
              <Text className='ju-sub'>{currentChart.yang ? '阳遁顺布' : '阴遁逆布'}</Text>
            </View>
          </View>

          <View className='intro-card'>
            <Text className='intro-title'>奇门遁甲排盘说明</Text>
            <Text className='intro-text'>
              奇门遁甲为中国三式之首，以时间为基础，将九星、八门、八神、天干布于九宫之中，通过分析各宫位的组合关系，判断事情的吉凶走势。
            </Text>
            <Text className='intro-text'>
              本系统采用时家奇门，以当前时辰自动起局，无需手动输入。请静心思考您的问题，然后选择问题类型进行测算。
            </Text>
          </View>

          <Button className='btn-primary' onClick={() => setStep('question')}>
            开始起局测算
          </Button>
        </View>
      )}

      {/* Step 2: 选择问题 */}
      {step === 'question' && (
        <View className='question-area'>
          <Text className='question-hint'>静心默想所问之事，选择问题类型</Text>
          <View className='question-grid'>
            {QUESTIONS.map(q => (
              <View key={q.label} className='question-item' onClick={() => handleSelectQuestion(q.label)}>
                <Text className='question-icon'>{q.icon}</Text>
                <Text className='question-label'>{q.label}</Text>
              </View>
            ))}
          </View>
          <Button className='btn-ghost' onClick={() => setStep('input')}>返回</Button>
        </View>
      )}

      {/* Step 3: 起局动画 */}
      {step === 'calculating' && (
        <View className='calculating-area'>
          <View className='calc-grid'>
            {GRID_ORDER.map(p => (
              <View key={p} className='calc-cell'>
                <Text className='calc-palace'>{currentChart.palaces[p - 1]?.palaceName}</Text>
                <Text className='calc-dir'>{currentChart.palaces[p - 1]?.direction}</Text>
              </View>
            ))}
          </View>
          <Text className='calc-text'>正在起局排盘...</Text>
          <Text className='calc-question'>{question}</Text>
        </View>
      )}

      {/* Step 4: 结果 */}
      {step === 'result' && chart && interp && (
        <View className='result-area'>
          {/* 头部信息 */}
          <View className='result-header'>
            <View className='result-meta'>
              <Text className='meta-question'>「{question}」</Text>
              <Text className='meta-ju'>{chart.juName}</Text>
            </View>
            <View className='score-circle' style={{ borderColor: getScoreColor(interp.score) }}>
              <Text className='score-num' style={{ color: getScoreColor(interp.score) }}>{interp.score}</Text>
              <Text className='score-label'>综合评分</Text>
            </View>
          </View>

          {/* Tab 切换 */}
          <View className='tab-bar'>
            <View className={`tab-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
              <Text>九宫盘面</Text>
            </View>
            <View className={`tab-item ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => setActiveTab('detail')}>
              <Text>详细解读</Text>
            </View>
          </View>

          {/* 九宫盘面 */}
          {activeTab === 'board' && (
            <View className='board-area'>
              <View className='palace-grid'>
                {GRID_ORDER.map(p => {
                  const pal = chart.palaces[p - 1]
                  const isMain = p === interp.mainPalace.palaceNum
                  const isZhiFu = p === chart.zhiFu
                  return (
                    <View key={p} className={`palace-cell ${isMain ? 'main' : ''} ${isZhiFu ? 'zhifu' : ''}`}>
                      {/* 宫名方位 */}
                      <View className='cell-top'>
                        <Text className='cell-dir'>{pal.direction}</Text>
                        {isMain && <Text className='cell-badge main-badge'>用</Text>}
                        {isZhiFu && !isMain && <Text className='cell-badge zhifu-badge'>符</Text>}
                      </View>
                      {/* 天干 */}
                      <Text className='cell-stem'>{pal.stem}</Text>
                      {/* 九星 */}
                      <View className={`cell-star nature-${getNatureClass(pal.starNature)}`}>
                        <Text className='cell-star-text'>{pal.star}</Text>
                      </View>
                      {/* 八门 */}
                      {pal.gate ? (
                        <View className={`cell-gate nature-${getNatureClass(pal.gateNature)}`}>
                          <Text className='cell-gate-text'>{pal.gate}</Text>
                        </View>
                      ) : (
                        <View className='cell-gate-empty'>
                          <Text className='cell-gate-text'>—</Text>
                        </View>
                      )}
                      {/* 八神 */}
                      <View className={`cell-god nature-${getNatureClass(pal.godNature)}`}>
                        <Text className='cell-god-text'>{pal.god}</Text>
                      </View>
                    </View>
                  )
                })}
              </View>

              {/* 图例 */}
              <View className='legend'>
                <View className='legend-row'>
                  <View className='legend-dot nature-great' /><Text className='legend-text'>大吉</Text>
                  <View className='legend-dot nature-good' /><Text className='legend-text'>吉</Text>
                  <View className='legend-dot nature-neutral' /><Text className='legend-text'>中</Text>
                  <View className='legend-dot nature-bad' /><Text className='legend-text'>凶</Text>
                  <View className='legend-dot nature-very-bad' /><Text className='legend-text'>大凶</Text>
                </View>
                <Text className='legend-note'>用=用神宫 · 符=值符宫</Text>
              </View>

              {/* 干支信息 */}
              <View className='gz-row'>
                {[
                  { label: '年', value: chart.yearGz },
                  { label: '月', value: chart.monthGz },
                  { label: '日', value: chart.dayGz },
                  { label: '时', value: chart.hourGz },
                ].map(item => (
                  <View key={item.label} className='gz-item'>
                    <Text className='gz-label'>{item.label}</Text>
                    <Text className='gz-value'>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 详细解读 */}
          {activeTab === 'detail' && (
            <View className='detail-area'>
              {/* 综合解析（叙述性段落） */}
              <View className='narrative-card'>
                <Text className='narrative-title'>综合解析</Text>
                {interp.overall.split('\n\n').map((para, i) => (
                  <Text key={i} className='narrative-para'>{para}</Text>
                ))}
              </View>

              {/* 用神 */}
              <View className='detail-section accent'>
                <Text className='detail-title'>用神参考</Text>
                {interp.yongshen.split('\n').map((line, i) => (
                  <Text key={i} className={i === 0 ? 'detail-body bold' : 'detail-body'}>{line}</Text>
                ))}
              </View>

              {/* 主宫四要素 */}
              <View className='main-palace-card'>
                <Text className='mpc-title'>
                  主宫：{interp.mainPalace.palaceName}（{interp.mainPalace.direction}）
                </Text>
                <View className='mpc-row'>
                  {[
                    { label: '天干', value: interp.mainPalace.stem, nature: '' },
                    { label: '九星', value: interp.mainPalace.star, nature: interp.mainPalace.starNature },
                    { label: '八门', value: interp.mainPalace.gate || '无门', nature: interp.mainPalace.gateNature },
                    { label: '八神', value: interp.mainPalace.god, nature: interp.mainPalace.godNature },
                  ].map(item => (
                    <View key={item.label} className='mpc-item'>
                      <Text className='mpc-label'>{item.label}</Text>
                      <Text className={`mpc-value ${item.nature ? 'nature-text-' + getNatureClass(item.nature) : ''}`}>
                        {item.value}
                      </Text>
                      {item.nature && (
                        <Text className={`mpc-nature nature-text-${getNatureClass(item.nature)}`}>
                          {item.nature}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* 三层独立解读 */}
              {[
                { title: '八门解读', content: interp.gateAnalysis },
                { title: '九星解读', content: interp.starAnalysis },
                { title: '八神解读', content: interp.godAnalysis },
              ].map(sec => (
                <View key={sec.title} className='detail-section'>
                  <Text className='detail-title'>{sec.title}</Text>
                  {sec.content.split('\n').map((line, i) => (
                    <Text key={i} className={i === 0 ? 'detail-body bold accent-text' : 'detail-body'}>{line}</Text>
                  ))}
                </View>
              ))}

              {/* 五行生克 */}
              <View className='detail-section'>
                <Text className='detail-title'>五行生克</Text>
                <Text className='detail-body'>{interp.fivePhase}</Text>
              </View>

              {/* 吉方吉时 */}
              <View className='lucky-row'>
                <View className='lucky-item'>
                  <Text className='lucky-icon'>◈</Text>
                  <Text className='lucky-label'>吉方</Text>
                  <Text className='lucky-value'>{interp.luckyDir}</Text>
                </View>
                <View className='lucky-item'>
                  <Text className='lucky-icon'>◷</Text>
                  <Text className='lucky-label'>吉时</Text>
                  <Text className='lucky-value'>{interp.luckyTime}</Text>
                </View>
              </View>

              {/* 行动建议 */}
              <View className='suggestion-box'>
                <Text className='suggestion-label'>▸ 行动建议</Text>
                <Text className='suggestion-text'>{interp.suggestion}</Text>
              </View>
            </View>
          )}

          <Button className='btn-primary' onClick={reset}>重新测算</Button>
        </View>
      )}
    </View>
  )
}
