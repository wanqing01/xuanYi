import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    // 跳转到占卜页（tabBar 首页）
    Taro.switchTab({ url: '/pages/divination/index' })
  })

  return (
    <View className='splash'>
      <Text className='splash-title'>天机阁</Text>
      <Text className='splash-sub'>探索命运的奥秘</Text>
    </View>
  )
}
