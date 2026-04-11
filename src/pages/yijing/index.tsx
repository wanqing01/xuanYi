import { useState, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { hexagrams } from '../../lib/fortune-data'
import './index.scss'

type YaoType = 0 | 1

interface DivinationResult {
  hexagram: typeof hexagrams[0]
  yaos: YaoType[]
}

const yaoLabels = ['初', '二', '三', '四', '五', '上']

export default function YijingPage() {
  const [yaos, setYaos] = useState<YaoType[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [result, setResult] = useState<DivinationResult | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  const generateYao = useCallback((): YaoType => {
    const coins = [
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ]
    const sum = coins.reduce((a, b) => a + b, 0)
    return (sum === 7 || sum === 9) ? 1 : 0
  }, [])

  const getHexagram = useCallback((yaoArray: YaoType[]) => {
    const index = yaoArray.reduce((acc, yao, i) => acc + yao * Math.pow(2, i), 0)
    return hexagrams[index % hexagrams.length]
  }, [])

  const handleShake = useCallback(() => {
    if (isShaking || yaos.length >= 6) return
    setIsShaking(true)
    setShowInstructions(false)

    Taro.vibrateShort({ type: 'medium' }).catch(() => {})

    setTimeout(() => {
      const newYao = generateYao()
      setYaos(prev => {
        const newYaos = [...prev, newYao]
        if (newYaos.length === 6) {
          const hexagram = getHexagram(newYaos)
          setTimeout(() => setResult({ hexagram, yaos: newYaos }), 500)
        }
        return newYaos
      })
      setIsShaking(false)
    }, 800)
  }, [isShaking, yaos.length, generateYao, getHexagram])

  const reset = () => {
    setYaos([])
    setResult(null)
    setShowInstructions(true)
  }

  const getFortuneClass = (fortune: string) => {
    if (fortune.includes('大吉')) return 'tag-great'
    if (fortune.includes('吉')) return 'tag-good'
    if (fortune.includes('凶')) return 'tag-bad'
    return 'tag-neutral'
  }

  const renderYao = (yao: YaoType, index: number) => (
    <View key={index} className='yao-row'>
      {yao === 1 ? (
        <View className='yao-yang' />
      ) : (
        <View className='yao-yin'>
          <View className='yao-yin-left' />
          <View className='yao-yin-right' />
        </View>
      )}
      <Text className='yao-label'>{yaoLabels[index]}爻</Text>
    </View>
  )

  return (
    <View className='yijing-page'>
      <View className='page-header'>
        <Text className='page-title'>易经六爻占卜</Text>
        <Text className='page-subtitle'>心诚则灵，点击按钮六次得卦</Text>
      </View>

      {showInstructions && !result && (
        <View className='instructions'>
          <Text className='instructions-icon'>☯</Text>
          <Text className='instructions-text'>点击下方按钮开始占卜</Text>
          <Button className='btn-primary' onClick={handleShake}>开始摇卦</Button>
        </View>
      )}

      {!showInstructions && !result && (
        <View className='shaking-area'>
          <View className='yaos-display'>
            {[...yaos].reverse().map((yao, i) => renderYao(yao, yaos.length - 1 - i))}
          </View>

          {isShaking && (
            <View className='shaking-icon'>
              <Text className='shaking-text'>☯</Text>
            </View>
          )}

          <View className='progress-area'>
            <Text className='progress-text'>
              已摇 <Text className='progress-count'>{yaos.length}</Text> / 6 次
            </Text>
            {yaos.length < 6 && !isShaking && (
              <Button className='btn-outline' onClick={handleShake}>继续摇卦</Button>
            )}
          </View>
        </View>
      )}

      {result && (
        <View className='result-card'>
          <View className='result-header'>
            <Text className='hexagram-symbol'>{result.hexagram.symbol}</Text>
            <Text className='hexagram-name'>{result.hexagram.name}卦</Text>
            <View className={`fortune-tag ${getFortuneClass(result.hexagram.fortune)}`}>
              <Text>{result.hexagram.fortune}</Text>
            </View>
          </View>

          <View className='yaos-result'>
            {[...result.yaos].reverse().map((yao, i) => renderYao(yao, result.yaos.length - 1 - i))}
          </View>

          <View className='result-details'>
            <View className='detail-item'>
              <Text className='detail-label'>卦辞</Text>
              <Text className='detail-value'>{result.hexagram.meaning}</Text>
            </View>
            <View className='detail-item'>
              <Text className='detail-label'>五行属性</Text>
              <Text className='detail-value'>{result.hexagram.element}</Text>
            </View>
            <View className='detail-item'>
              <Text className='detail-label'>占卜建议</Text>
              <Text className='detail-value primary'>{result.hexagram.advice}</Text>
            </View>
          </View>

          <Button className='btn-primary' onClick={reset}>重新占卜</Button>
        </View>
      )}
    </View>
  )
}
