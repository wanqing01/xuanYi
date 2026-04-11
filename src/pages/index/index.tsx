import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index() {
  useLoad(() => {
    // 自动跳转到易经页面（tabBar 首页）
    Taro.switchTab({ url: '/pages/yijing/index' })
  })

  return (
    <View className='splash'>
      <Text className='splash-title'>天机阁</Text>
      <Text className='splash-sub'>探索命运的奥秘</Text>
    </View>
  )
}
