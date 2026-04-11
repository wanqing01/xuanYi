import { useState, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { zodiacSigns, zodiacSymbols, fortuneCategories, getDailySeededRandom } from '../../lib/fortune-data'
import './index.scss'

interface FortuneData {
  overall: number
  love: number
  career: number
  wealth: number
  health: number
  luckyNumber: number
  luckyColor: string
  luckyDirection: string
  advice: string
}

const luckyColors = ["红色", "金色", "蓝色", "绿色", "紫色", "白色", "黄色", "橙色", "粉色", "黑色"]
const directions = ["东方", "南方", "西方", "北方", "东南", "东北", "西南", "西北"]
const advices = [
  "今日宜静心沉思，不宜冲动行事",
  "贵人相助运势佳，可大胆尝试新事物",
  "财运亨通，但需谨防小人",
  "感情运势上升，单身者有望遇到心仪对象",
  "工作上会有新的突破，把握机会",
  "适合整理思绪，规划未来方向",
  "与朋友聚会可带来好运",
  "投资理财需谨慎，不宜冒险",
  "健康方面需注意休息，避免过度劳累",
  "学业运势佳，适合专注学习",
  "今日桃花运旺，注意形象打扮",
  "事业有贵人相助，勇于表现自己",
]

export default function DailyPage() {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null)
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const today = useMemo(() => new Date(), [])
  const dateStr = useMemo(() => `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`, [today])

  const generateFortune = (zodiac: string): FortuneData => {
    const zodiacIndex = zodiacSigns.indexOf(zodiac)
    const seed = (offset: number) => getDailySeededRandom(today, zodiacIndex * 100 + offset)
    return {
      overall: Math.floor(seed(1) * 40) + 60,
      love: Math.floor(seed(2) * 40) + 60,
      career: Math.floor(seed(3) * 40) + 60,
      wealth: Math.floor(seed(4) * 40) + 60,
      health: Math.floor(seed(5) * 40) + 60,
      luckyNumber: Math.floor(seed(6) * 9) + 1,
      luckyColor: luckyColors[Math.floor(seed(7) * luckyColors.length)],
      luckyDirection: directions[Math.floor(seed(8) * directions.length)],
      advice: advices[Math.floor(seed(9) * advices.length)],
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
            <View className='overall-score'>
              <Text className='score-label'>综合运势</Text>
              <Text className={`score-value ${getScoreColor(fortune.overall)}`}>{fortune.overall}</Text>
              <Text className='score-max'>/ 100</Text>
            </View>

            <View className='score-divider' />

            <View className='score-list'>
              {fortuneCategories.slice(1).map(cat => (
                <View key={cat.key} className='score-row'>
                  <Text className='score-icon'>{cat.icon}</Text>
                  <Text className='score-name'>{cat.name}</Text>
                  <View className='score-bar-bg'>
                    <View
                      className={`score-bar-fill ${getScoreColor(fortune[cat.key as keyof FortuneData] as number)}`}
                      style={{ width: `${fortune[cat.key as keyof FortuneData]}%` }}
                    />
                  </View>
                  <Text className={`score-num ${getScoreColor(fortune[cat.key as keyof FortuneData] as number)}`}>
                    {fortune[cat.key as keyof FortuneData]}
                  </Text>
                </View>
              ))}
            </View>

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
            </View>

            <View className='advice-area'>
              <Text className='advice-label'>今日箴言</Text>
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
