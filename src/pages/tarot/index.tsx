import { useState, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { tarotCards } from '../../lib/fortune-data'
import './index.scss'

interface SelectedCard {
  card: typeof tarotCards[0]
  isReversed: boolean
  position: 'past' | 'present' | 'future'
}

const positions = [
  { key: 'past' as const, name: '过去', description: '影响现状的过去因素' },
  { key: 'present' as const, name: '现在', description: '当前面临的状况' },
  { key: 'future' as const, name: '未来', description: '可能的发展趋势' },
]

const cardEmojis = ["🃏", "✨", "🌙", "👑", "⚔️", "🏛️", "❤️", "🎭", "🦁", "🏮", "☸️", "⚖️",
  "🔮", "💀", "⚗️", "👹", "🗼", "⭐", "🌑", "☀️", "📯", "🌍"]

export default function TarotPage() {
  const [step, setStep] = useState<'intro' | 'shuffling' | 'selecting' | 'result'>('intro')
  const [shuffledDeck, setShuffledDeck] = useState<typeof tarotCards>([])
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([])
  const [currentPosition, setCurrentPosition] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)

  const shuffleDeck = useCallback(() => {
    setStep('shuffling')
    setTimeout(() => {
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)
      setShuffledDeck(shuffled)
      setStep('selecting')
    }, 2000)
  }, [])

  const selectCard = useCallback((index: number) => {
    if (currentPosition >= 3) return
    const card = shuffledDeck[index]
    const isReversed = Math.random() > 0.5
    const position = positions[currentPosition].key

    setSelectedCards(prev => [...prev, { card, isReversed, position }])
    setShuffledDeck(prev => prev.filter((_, i) => i !== index))

    if (currentPosition === 2) {
      setTimeout(() => {
        setStep('result')
        setTimeout(() => setRevealedCount(1), 500)
        setTimeout(() => setRevealedCount(2), 1500)
        setTimeout(() => setRevealedCount(3), 2500)
      }, 500)
    } else {
      setCurrentPosition(prev => prev + 1)
    }
  }, [currentPosition, shuffledDeck])

  const reset = () => {
    setStep('intro')
    setShuffledDeck([])
    setSelectedCards([])
    setCurrentPosition(0)
    setRevealedCount(0)
  }

  return (
    <View className='tarot-page'>
      <View className='page-header'>
        <Text className='page-title'>塔罗占卜</Text>
        <Text className='page-subtitle'>三牌阵 · 过去、现在、未来</Text>
      </View>

      {step === 'intro' && (
        <View className='intro-area'>
          <View className='card-preview'>
            {[0, 1, 2].map(i => (
              <View key={i} className='card-back-preview'>
                <Text className='card-back-icon'>✧</Text>
              </View>
            ))}
          </View>
          <Text className='intro-text'>静心冥想您想要了解的问题，然后开始洗牌</Text>
          <Button className='btn-primary' onClick={shuffleDeck}>开始洗牌</Button>
        </View>
      )}

      {step === 'shuffling' && (
        <View className='shuffling-area'>
          <View className='shuffle-cards'>
            {[0, 1, 2].map(i => (
              <View key={i} className='card-back-sm'>
                <Text className='card-back-icon'>✧</Text>
              </View>
            ))}
          </View>
          <Text className='shuffling-text'>洗牌中...</Text>
        </View>
      )}

      {step === 'selecting' && (
        <View className='selecting-area'>
          <View className='position-hint'>
            <Text className='hint-sub'>请选择第 {currentPosition + 1} 张牌</Text>
            <Text className='hint-main'>{positions[currentPosition].name}</Text>
            <Text className='hint-desc'>{positions[currentPosition].description}</Text>
          </View>

          <View className='selected-slots'>
            {positions.map((pos, i) => (
              <View key={pos.key} className='slot'>
                <Text className='slot-label'>{pos.name}</Text>
                {selectedCards[i] ? (
                  <View className='card-front-sm'>
                    <Text className='card-emoji'>{cardEmojis[selectedCards[i].card.number]}</Text>
                    <Text className='card-name-sm'>{selectedCards[i].card.name}</Text>
                  </View>
                ) : (
                  <View className='slot-empty' />
                )}
              </View>
            ))}
          </View>

          <View className='deck-area'>
            {shuffledDeck.slice(0, 12).map((_, index) => (
              <View key={index} className='card-back-pick' onClick={() => selectCard(index)}>
                <Text className='card-back-icon'>✧</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {step === 'result' && (
        <View className='result-area'>
          <View className='result-cards'>
            {selectedCards.map((sc, i) => (
              <View key={i} className='result-card-col'>
                <Text className='result-pos-label'>{positions[i].name}</Text>
                {revealedCount > i ? (
                  <View className={`card-front-lg ${sc.isReversed ? 'reversed' : ''}`}>
                    <Text className='card-num-sm'>{sc.card.number}</Text>
                    <Text className='card-emoji-lg'>{cardEmojis[sc.card.number]}</Text>
                    <Text className='card-name-lg'>{sc.card.name}</Text>
                  </View>
                ) : (
                  <View className='card-back-lg'>
                    <Text className='card-back-icon'>✧</Text>
                  </View>
                )}
                {revealedCount > i && sc.isReversed && (
                  <Text className='reversed-tag'>逆位</Text>
                )}
              </View>
            ))}
          </View>

          {revealedCount >= 3 && (
            <View className='interpretations'>
              {selectedCards.map((sc, i) => (
                <View key={i} className='interp-card'>
                  <View className='interp-header'>
                    <Text className='interp-pos'>{positions[i].name}</Text>
                    <Text className='interp-name'>{sc.card.name}</Text>
                    {sc.isReversed && <Text className='reversed-badge'>逆位</Text>}
                  </View>
                  <Text className='interp-meaning'>
                    {sc.isReversed ? sc.card.reversed : sc.card.meaning}
                  </Text>
                  <Text className='interp-advice'>
                    <Text className='advice-prefix'>建议：</Text>{sc.card.advice}
                  </Text>
                </View>
              ))}

              <View className='summary-card'>
                <Text className='summary-title'>综合解读</Text>
                <Text className='summary-text'>
                  您的过去受到「{selectedCards[0]?.card.name}」的影响，
                  现在正处于「{selectedCards[1]?.card.name}」的状态，
                  未来将朝向「{selectedCards[2]?.card.name}」发展。
                  建议您保持开放的心态，顺应生命的指引前进。
                </Text>
              </View>

              <Button className='btn-primary' onClick={reset}>重新占卜</Button>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
