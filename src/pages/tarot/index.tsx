import { useState, useCallback, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { tarotCards } from '../../lib/fortune-data'
import './index.scss'

interface TarotCard {
  name: string; number: number; meaning: string; reversed: string; advice: string
  element?: string; planet?: string; keywords?: string[]
  love?: string; loveReversed?: string
  career?: string; careerReversed?: string
  wealth?: string; health?: string
}

interface SelectedCard {
  card: TarotCard
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
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([])
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([])
  const [currentPosition, setCurrentPosition] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  // 洗牌动画阶段：0=散开 1=旋转混洗 2=聚拢 3=完成
  const [shufflePhase, setShufflePhase] = useState(0)
  const [shuffleText, setShuffleText] = useState('正在净化牌组...')

  const shuffleDeck = useCallback(() => {
    setStep('shuffling')
    setShufflePhase(0)
    setShuffleText('正在净化牌组...')

    setTimeout(() => { setShufflePhase(1); setShuffleText('感应宇宙能量...') }, 600)
    setTimeout(() => { setShufflePhase(2); setShuffleText('混洗命运之牌...') }, 1400)
    setTimeout(() => { setShufflePhase(3); setShuffleText('牌阵已就绪') }, 2400)

    setTimeout(() => {
      const shuffled = ([...tarotCards] as TarotCard[]).sort(() => Math.random() - 0.5)
      setShuffledDeck(shuffled)
      setStep('selecting')
    }, 3200)
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

  const reset = () => {    setStep('intro')
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
          {/* 光晕背景 */}
          <View className={`shuffle-glow phase-${shufflePhase}`} />

          {/* 牌组动画 */}
          <View className='shuffle-stage'>
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <View
                key={i}
                className={`shuffle-card shuffle-card-${i} phase-${shufflePhase}`}
              >
                <Text className='shuffle-card-icon'>✧</Text>
              </View>
            ))}
            {/* 中心符文 */}
            <View className={`shuffle-rune phase-${shufflePhase}`}>
              <Text className='shuffle-rune-text'>☽</Text>
            </View>
          </View>

          {/* 进度文字 */}
          <View className='shuffle-progress'>
            <View className='shuffle-dots'>
              {[0, 1, 2, 3].map(i => (
                <View key={i} className={`shuffle-dot ${shufflePhase > i ? 'done' : shufflePhase === i ? 'active' : ''}`} />
              ))}
            </View>
            <Text className='shuffling-text'>{shuffleText}</Text>
          </View>
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
                    <Text className='card-emoji'>{cardEmojis[selectedCards[i]!.card.number]}</Text>
                    <Text className='card-name-sm'>{selectedCards[i]!.card.name}</Text>
                  </View>
                ) : (
                  <View className='slot-empty' />
                )}
              </View>
            ))}
          </View>

          <View className='deck-area'>
            {shuffledDeck.map((_, index) => (
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
                  {/* 牌名 + 位置 + 逆位标记 */}
                  <View className='interp-header'>
                    <View className='interp-title-row'>
                      <Text className='interp-pos'>{positions[i].name}</Text>
                      <Text className='interp-name'>{sc.card.name}</Text>
                      {sc.isReversed && <Text className='reversed-badge'>逆位</Text>}
                    </View>
                  {/* 守护星 + 元素 + 关键词 */}
                    <View className='interp-meta'>
                      <Text className='meta-tag'>{sc.card.planet ? `☿ ${sc.card.planet}` : ''}</Text>
                      <Text className='meta-tag'>{sc.card.element ? `◈ ${sc.card.element}` : ''}</Text>
                    </View>
                    {sc.card.keywords && sc.card.keywords.length > 0 && (
                      <View className='keywords-row'>
                        {sc.card.keywords.map((k: string) => (
                          <View key={k} className='keyword-chip'><Text>{k}</Text></View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* 核心含义 */}
                  <Text className='interp-meaning'>
                    {sc.isReversed ? sc.card.reversed : sc.card.meaning}
                  </Text>

                  {/* 感情 / 事业 / 财运 / 健康 四维解读 */}
                  {sc.card.love && (
                    <View className='dimension-list'>
                      {[
                        { icon: '♡', label: '感情', text: sc.isReversed ? (sc.card.loveReversed ?? sc.card.love) : sc.card.love },
                        { icon: '◆', label: '事业', text: sc.isReversed ? (sc.card.careerReversed ?? sc.card.career ?? '') : (sc.card.career ?? '') },
                        { icon: '◈', label: '财运', text: sc.card.wealth ?? '' },
                        { icon: '❖', label: '健康', text: sc.card.health ?? '' },
                      ].map(dim => (
                        <View key={dim.label} className='dim-item'>
                          <View className='dim-header'>
                            <Text className='dim-icon'>{dim.icon}</Text>
                            <Text className='dim-label'>{dim.label}</Text>
                          </View>
                          <Text className='dim-text'>{dim.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 建议 */}
                  <View className='advice-box'>
                    <Text className='advice-prefix'>▸ 建议</Text>
                    <Text className='advice-text'>{sc.card.advice}</Text>
                  </View>                </View>
              ))}

              {/* 综合解读 */}
              <View className='summary-card'>
                <Text className='summary-title'>综合解读</Text>
                <Text className='summary-text'>
                  {[
                    `过去「${selectedCards[0]?.card.name ?? ''}」${selectedCards[0]?.isReversed ? '（逆位）' : ''}：${selectedCards[0]?.isReversed ? (selectedCards[0].card.loveReversed ?? selectedCards[0].card.reversed) : (selectedCards[0]?.card.love ?? selectedCards[0]?.card.meaning ?? '')}。`,
                    `现在「${selectedCards[1]?.card.name ?? ''}」${selectedCards[1]?.isReversed ? '（逆位）' : ''}：${selectedCards[1]?.isReversed ? (selectedCards[1].card.careerReversed ?? selectedCards[1].card.reversed) : (selectedCards[1]?.card.career ?? selectedCards[1]?.card.meaning ?? '')}。`,
                    `未来「${selectedCards[2]?.card.name ?? ''}」${selectedCards[2]?.isReversed ? '（逆位）' : ''}：${selectedCards[2]?.card.advice ?? ''}。`,
                  ].join('\n\n')}
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
