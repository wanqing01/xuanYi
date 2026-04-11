import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { qimenPalaces, qimenGates, qimenStars, qimenGods, getCurrentHour } from '../../lib/fortune-data'
import './index.scss'

interface QimenResult {
  palace: typeof qimenPalaces[0]
  gate: typeof qimenGates[0]
  star: typeof qimenStars[0]
  god: typeof qimenGods[0]
  hour: string
  analysis: string
  suggestion: string
}

const questions = [
  { label: "事业前程", icon: "◇" },
  { label: "财运投资", icon: "◈" },
  { label: "婚姻感情", icon: "♡" },
  { label: "健康疾病", icon: "❖" },
  { label: "出行求谋", icon: "✦" },
  { label: "诉讼官非", icon: "⚖" },
  { label: "考试学业", icon: "📚" },
  { label: "其他问题", icon: "✧" },
]

export default function QimenPage() {
  const [step, setStep] = useState<'question' | 'calculating' | 'result'>('question')
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [result, setResult] = useState<QimenResult | null>(null)

  const currentHour = useMemo(() => getCurrentHour(), [])

  const generateResult = (question: string): QimenResult => {
    const now = new Date()
    const seed = now.getTime() + question.length
    const random = (max: number) => Math.floor((seed * 9301 + 49297) % 233280 / 233280 * max)

    const palace = qimenPalaces[random(qimenPalaces.length)]
    const gate = qimenGates[random(qimenGates.length)]
    const star = qimenStars[random(qimenStars.length)]
    const god = qimenGods[random(qimenGods.length)]

    const isGood = (gate.nature.includes('吉') ? 1 : 0) +
      (star.nature === '吉' ? 1 : 0) +
      (god.nature.includes('吉') ? 1 : 0) >= 2

    const analyses = isGood ? [
      `此局${gate.name}临${palace.position}，得${star.name}相助，${god.name}护佑，整体格局吉利。`,
      `${palace.direction}方位为主，${gate.name}开启机缘，${star.name}照临，天时地利俱全。`,
      `时值${currentHour.name}，${god.name}当值，配合${gate.name}之力，可谓天时相助。`,
    ] : [
      `此局${gate.name}临${palace.position}，${star.name}受制，需谨慎行事。`,
      `${palace.direction}方位有阻，${gate.name}显示需要等待更好时机。`,
      `时值${currentHour.name}，${god.name}当值，建议暂缓行动，静观其变。`,
    ]

    const suggestions = isGood ? [
      "可择日行动，把握良机，事半功倍",
      "贵人在侧，多方求助可得善果",
      "顺势而为，大胆进取，必有所成",
    ] : [
      "暂宜守成，不宜妄动，以静制动",
      "多加思量，谨慎行事，可避凶趋吉",
      "耐心等待，时机未到，勿要强求",
    ]

    return {
      palace, gate, star, god,
      hour: currentHour.name,
      analysis: analyses[random(analyses.length)],
      suggestion: suggestions[random(suggestions.length)],
    }
  }

  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question)
    setStep('calculating')
    setTimeout(() => {
      setResult(generateResult(question))
      setStep('result')
    }, 3000)
  }

  const reset = () => {
    setStep('question')
    setSelectedQuestion(null)
    setResult(null)
  }

  const getNatureClass = (nature: string) => {
    if (nature.includes('大吉')) return 'nature-great'
    if (nature.includes('吉')) return 'nature-good'
    if (nature.includes('大凶')) return 'nature-very-bad'
    if (nature.includes('凶')) return 'nature-bad'
    return 'nature-neutral'
  }

  return (
    <View className='qimen-page'>
      <View className='page-header'>
        <Text className='page-title'>奇门遁甲</Text>
        <Text className='page-subtitle'>时家奇门 · {currentHour.name}局</Text>
      </View>

      {step === 'question' && (
        <View className='question-area'>
          <Text className='question-hint'>请选择您要测算的问题类型</Text>
          <View className='question-grid'>
            {questions.map(q => (
              <View key={q.label} className='question-item' onClick={() => handleSelectQuestion(q.label)}>
                <Text className='question-icon'>{q.icon}</Text>
                <Text className='question-label'>{q.label}</Text>
              </View>
            ))}
          </View>

          <View className='hour-info'>
            <Text className='hour-label'>当前时辰</Text>
            <Text className='hour-name'>{currentHour.name}</Text>
            <Text className='hour-range'>{currentHour.range}</Text>
          </View>
        </View>
      )}

      {step === 'calculating' && (
        <View className='calculating-area'>
          <View className='palace-grid-anim'>
            {qimenPalaces.map(palace => (
              <View key={palace.position} className='palace-cell-anim'>
                <Text className='palace-cell-text'>{palace.position}</Text>
              </View>
            ))}
          </View>
          <Text className='calculating-text'>正在起局测算...</Text>
          <Text className='calculating-question'>{selectedQuestion}</Text>
        </View>
      )}

      {step === 'result' && result && (
        <View className='result-area'>
          <View className='result-meta'>
            <Text className='meta-text'>测算问题：</Text>
            <Text className='meta-question'>{selectedQuestion}</Text>
            <Text className='meta-hour'> · {result.hour}局</Text>
          </View>

          <View className='palace-grid'>
            {qimenPalaces.map(palace => {
              const isActive = palace.position === result.palace.position
              return (
                <View key={palace.position} className={`palace-cell ${isActive ? 'active' : ''}`}>
                  <Text className={`palace-name ${isActive ? 'active-text' : ''}`}>{palace.position}</Text>
                  <Text className='palace-dir'>{palace.direction}</Text>
                  {isActive && <Text className='palace-star'>★</Text>}
                </View>
              )
            })}
          </View>

          <View className='info-grid'>
            <View className='info-card'>
              <Text className='info-label'>八门</Text>
              <Text className='info-value'>{result.gate.name}</Text>
              <View className={`nature-tag ${getNatureClass(result.gate.nature)}`}>
                <Text>{result.gate.nature}</Text>
              </View>
            </View>
            <View className='info-card'>
              <Text className='info-label'>九星</Text>
              <Text className='info-value'>{result.star.name}</Text>
              <View className={`nature-tag ${getNatureClass(result.star.nature)}`}>
                <Text>{result.star.nature}</Text>
              </View>
            </View>
            <View className='info-card'>
              <Text className='info-label'>八神</Text>
              <Text className='info-value'>{result.god.name}</Text>
              <View className={`nature-tag ${getNatureClass(result.god.nature)}`}>
                <Text>{result.god.nature}</Text>
              </View>
            </View>
            <View className='info-card'>
              <Text className='info-label'>落宫</Text>
              <Text className='info-value'>{result.palace.position}</Text>
              <Text className='info-sub'>{result.palace.element} · {result.palace.direction}</Text>
            </View>
          </View>

          <View className='analysis-card'>
            <View className='analysis-section'>
              <Text className='section-label'>局象解析</Text>
              <Text className='section-text'>{result.analysis}</Text>
            </View>
            <View className='section-divider' />
            <View className='analysis-section'>
              <Text className='section-label'>八门解读</Text>
              <Text className='section-text'>{result.gate.meaning}</Text>
            </View>
            <View className='section-divider' />
            <View className='analysis-section'>
              <Text className='section-label'>八神解读</Text>
              <Text className='section-text'>{result.god.meaning}</Text>
            </View>
            <View className='section-divider' />
            <View className='analysis-section'>
              <Text className='section-label primary'>行动建议</Text>
              <Text className='section-text primary'>{result.suggestion}</Text>
            </View>
          </View>

          <Button className='btn-primary' onClick={reset}>重新测算</Button>
        </View>
      )}
    </View>
  )
}
