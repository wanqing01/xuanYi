import { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { hexagrams } from '../../lib/fortune-data'
import './index.scss'

type YaoType = 0 | 1

interface DivinationResult {
  hexagram: typeof hexagrams[0]
  yaos: YaoType[]
  upperName: string
  lowerName: string
}

const yaoLabels = ['初', '二', '三', '四', '五', '上']

// ── 八卦二进制编码（后天八卦，三爻→0-7）──────────────────────
// 爻从下到上：初爻=bit0, 二爻=bit1, 三爻=bit2
// 坤000=0 震001=1 坎010=2 兑011=3 艮100=4 离101=5 巽110=6 乾111=7
const TRIGRAM_NAMES = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']

// 六十四卦查找表：[上卦0-7][下卦0-7] → hexagrams数组中的卦名
// 按《周易》序卦排列，上卦为外卦，下卦为内卦
const HEXAGRAM_TABLE: Record<string, string> = {
  // 上卦乾(7)
  '7-7': '乾', '7-6': '姤', '7-5': '同人', '7-4': '履',
  '7-3': '无妄', '7-2': '讼', '7-1': '遁', '7-0': '否',
  // 上卦坤(0)
  '0-0': '坤', '0-1': '复', '0-2': '师', '0-3': '谦',
  '0-4': '升', '0-5': '明夷', '0-6': '临', '0-7': '泰',
  // 上卦震(1)
  '1-1': '震', '1-0': '豫', '1-2': '解', '1-3': '归妹',
  '1-4': '小过', '1-5': '丰', '1-6': '恒', '1-7': '大壮',
  // 上卦巽(6)
  '6-6': '巽', '6-7': '小畜', '6-5': '家人', '6-4': '渐',
  '6-3': '中孚', '6-2': '涣', '6-1': '益', '6-0': '观',
  // 上卦坎(2)
  '2-2': '坎', '2-3': '节', '2-7': '需', '2-6': '井',
  '2-5': '既济', '2-4': '蹇', '2-1': '屯', '2-0': '比',
  // 上卦离(5)
  '5-5': '离', '5-4': '旅', '5-0': '晋', '5-1': '噬嗑',
  '5-2': '未济', '5-3': '睽', '5-6': '鼎', '5-7': '大有',
  // 上卦艮(4)
  '4-4': '艮', '4-5': '贲', '4-0': '剥', '4-1': '颐',
  '4-2': '蒙', '4-3': '损', '4-6': '蛊', '4-7': '大畜',
  // 上卦兑(3)
  '3-3': '兑', '3-2': '困', '3-7': '夬', '3-6': '大过',
  '3-5': '革', '3-4': '咸', '3-1': '随', '3-0': '萃',
}

export default function YijingPage() {
  const [yaos, setYaos] = useState<YaoType[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [result, setResult] = useState<DivinationResult | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  const generateYao = useCallback((): YaoType => {
    // 三枚铜钱：正面=3，背面=2；和为6/8=阴爻，7/9=阳爻
    const coins = [
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
      Math.random() > 0.5 ? 3 : 2,
    ]
    const sum = coins.reduce((a, b) => a + b, 0)
    return (sum === 7 || sum === 9) ? 1 : 0
  }, [])

  const getHexagram = useCallback((yaoArray: YaoType[]) => {
    // 六爻：初爻到上爻（yaoArray[0]~[5]）
    // 下卦（内卦）= 初爻、二爻、三爻（yaoArray[0-2]）
    // 上卦（外卦）= 四爻、五爻、上爻（yaoArray[3-5]）
    const lowerVal = yaoArray[0] + yaoArray[1] * 2 + yaoArray[2] * 4
    const upperVal = yaoArray[3] + yaoArray[4] * 2 + yaoArray[5] * 4

    const upperName = TRIGRAM_NAMES[upperVal]
    const lowerName = TRIGRAM_NAMES[lowerVal]

    const key = `${upperVal}-${lowerVal}`
    const hexagramName = HEXAGRAM_TABLE[key]

    // 按名字查找卦象
    const hexagram = hexagrams.find(h => h.name === hexagramName)
      ?? hexagrams[0] // 兜底

    return { hexagram, upperName, lowerName }
  }, [])

  // ref 持有最新状态，供加速度回调读取
  const isShakingRef = useRef(false)
  const yaosRef      = useRef<YaoType[]>([])
  const resultRef    = useRef<DivinationResult | null>(null)
  isShakingRef.current = isShaking
  yaosRef.current      = yaos
  resultRef.current    = result

  const handleShake = useCallback(() => {
    if (isShakingRef.current || yaosRef.current.length >= 6 || resultRef.current) return
    setIsShaking(true)
    setShowInstructions(false)
    Taro.vibrateShort({ type: 'medium' }).catch(() => {})
    setTimeout(() => {
      const newYao = generateYao()
      setYaos(prev => {
        const newYaos = [...prev, newYao]
        if (newYaos.length === 6) {
          const { hexagram, upperName, lowerName } = getHexagram(newYaos)
          setTimeout(() => setResult({ hexagram, yaos: newYaos, upperName, lowerName }), 500)
        }
        return newYaos
      })
      setIsShaking(false)
    }, 800)
  }, [generateYao, getHexagram])

  // handleShake ref，让加速度回调始终调用最新版本
  const handleShakeRef = useRef(handleShake)
  handleShakeRef.current = handleShake

  // 摇一摇：先 start 成功后再注册回调
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0
    let lastTime = 0
    const THRESHOLD = 10
    const COOLDOWN  = 1000

    const callback: Taro.onAccelerometerChange.Callback = (res) => {
      const now = Date.now()
      const dx = Math.abs(res.x - lastX)
      const dy = Math.abs(res.y - lastY)
      const dz = Math.abs(res.z - lastZ)
      lastX = res.x; lastY = res.y; lastZ = res.z
      if (dx + dy + dz > THRESHOLD && now - lastTime > COOLDOWN) {
        lastTime = now
        handleShakeRef.current()
      }
    }

    Taro.startAccelerometer({
      interval: 'game',
      success: () => {
        Taro.onAccelerometerChange(callback)
      },
      fail: (err) => {
        Taro.onAccelerometerChange(callback)
      },
    })

    return () => {
      Taro.offAccelerometerChange(callback)
      Taro.stopAccelerometer().catch(() => {})
    }
  }, [])

  useDidShow(() => {
    Taro.startAccelerometer({ interval: 'game' }).catch(() => {})
  })
  useDidHide(() => {
    Taro.stopAccelerometer().catch(() => {})
  })

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
    </View>  )

  return (
    <View className='yijing-page'>
      <View className='page-header'>
        <Text className='page-title'>六爻占卜</Text>
        <Text className='page-subtitle'>心诚则灵，摇卦六次得卦象</Text>
      </View>

      {showInstructions && !result && (
        <View className='instructions'>
          <Text className='instructions-icon'>☯</Text>
          <Text className='instructions-text'>静心凝神，心中默想所问之事</Text>
          <Text className='instructions-sub'>摇动手机或点击按钮，连续六次得卦</Text>
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
          {/* 卦名与吉凶 */}
          <View className='result-header'>
            <Text className='hexagram-symbol'>{result.hexagram.symbol}</Text>
            <Text className='hexagram-name'>{result.hexagram.name}卦</Text>
            {/* 上下卦信息 */}
            <View className='trigram-row'>
              <View className='trigram-item'>
                <Text className='trigram-label'>外卦（上）</Text>
                <Text className='trigram-value'>{result.upperName}</Text>
              </View>
              <Text className='trigram-sep'>☯</Text>
              <View className='trigram-item'>
                <Text className='trigram-label'>内卦（下）</Text>
                <Text className='trigram-value'>{result.lowerName}</Text>
              </View>
            </View>
            <View className={`fortune-tag ${getFortuneClass(result.hexagram.fortune)}`}>
              <Text>{result.hexagram.fortune}</Text>
            </View>
          </View>

          {/* 爻象 */}
          <View className='yaos-result'>
            {[...result.yaos].reverse().map((yao, i) => renderYao(yao, result.yaos.length - 1 - i))}
          </View>

          {/* 卦辞 */}
          <View className='section'>
            <Text className='section-title'>卦辞</Text>
            <Text className='section-quote'>「{result.hexagram.meaning}」</Text>
          </View>

          {/* 卦象详解 */}
          <View className='section'>
            <Text className='section-title'>卦象解析</Text>
            <Text className='section-body'>{result.hexagram.description}</Text>
          </View>

          {/* 四维解读 */}
          <View className='section'>
            <Text className='section-title'>详细解读</Text>
            <View className='dimension-list'>
              <View className='dimension-item'>
                <View className='dimension-header'>
                  <Text className='dimension-icon'>♡</Text>
                  <Text className='dimension-name'>感情</Text>
                </View>
                <Text className='dimension-text'>{result.hexagram.love}</Text>
              </View>
              <View className='dimension-item'>
                <View className='dimension-header'>
                  <Text className='dimension-icon'>◆</Text>
                  <Text className='dimension-name'>事业</Text>
                </View>
                <Text className='dimension-text'>{result.hexagram.career}</Text>
              </View>
              <View className='dimension-item'>
                <View className='dimension-header'>
                  <Text className='dimension-icon'>◈</Text>
                  <Text className='dimension-name'>财运</Text>
                </View>
                <Text className='dimension-text'>{result.hexagram.wealth}</Text>
              </View>
              <View className='dimension-item'>
                <View className='dimension-header'>
                  <Text className='dimension-icon'>❖</Text>
                  <Text className='dimension-name'>健康</Text>
                </View>
                <Text className='dimension-text'>{result.hexagram.health}</Text>
              </View>
            </View>
          </View>

          {/* 占卜建议 */}
          <View className='advice-box'>
            <Text className='advice-label'>占卜建议</Text>
            <Text className='advice-text'>{result.hexagram.advice}</Text>
          </View>

          {/* 五行 */}
          <View className='meta-row'>
            <View className='meta-item'>
              <Text className='meta-label'>五行</Text>
              <Text className='meta-value'>{result.hexagram.element}</Text>
            </View>
            <View className='meta-item'>
              <Text className='meta-label'>卦序</Text>
              <Text className='meta-value'>第{hexagrams.findIndex(h => h.name === result.hexagram.name) + 1}卦</Text>
            </View>
          </View>

          <Button className='btn-primary' onClick={reset}>重新占卜</Button>
        </View>
      )}
    </View>
  )
}
