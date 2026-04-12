import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const TOOLS = [
  {
    id: 'yijing',
    title: '六爻占卜',
    subtitle: '铜钱摇卦 · 六十四卦',
    desc: '以三枚铜钱起卦，通过六爻阴阳组合推演六十四卦，洞察事物发展规律',
    icon: '☯',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.3)',
    path: '/pages/yijing/index',
  },
  {
    id: 'meihua',
    title: '梅花易数',
    subtitle: '时间起卦 · 本互变三卦',
    desc: '以时间或数字起卦，推演本卦、互卦、变卦，洞察事情的起因、过程与结果',
    icon: '✿',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.3)',
    path: '/pages/meihua/index',
  },
  {
    id: 'qimen',
    title: '奇门遁甲',
    subtitle: '时家奇门 · 九宫排盘',
    desc: '中国三式之首，以时辰起局，九星八门八神布于九宫，判断事情吉凶走势',
    icon: '◈',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.3)',
    path: '/pages/qimen/index',
  },
]

export default function DivinationPage() {
  const navigate = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <View className='divination-page'>
      <View className='page-header'>
        <Text className='page-title'>占卜</Text>
        <Text className='page-subtitle'>择一法门，问天地之机</Text>
      </View>

      <View className='tools-list'>
        {TOOLS.map(tool => (
          <View
            key={tool.id}
            className='tool-card'
            style={{ background: tool.bg, borderColor: tool.border }}
            onClick={() => navigate(tool.path)}
          >
            <View className='tool-left'>
              <View className='tool-icon-wrap' style={{ borderColor: tool.border }}>
                <Text className='tool-icon' style={{ color: tool.color }}>{tool.icon}</Text>
              </View>
            </View>
            <View className='tool-content'>
              <View className='tool-title-row'>
                <Text className='tool-title' style={{ color: tool.color }}>{tool.title}</Text>
                <Text className='tool-subtitle'>{tool.subtitle}</Text>
              </View>
              <Text className='tool-desc'>{tool.desc}</Text>
            </View>
            <Text className='tool-arrow'>›</Text>
          </View>
        ))}
      </View>

      {/* 预留扩展区域 */}
      <View className='coming-soon'>
        <Text className='coming-title'>更多占卜方式</Text>
        <Text className='coming-desc'>梅花易数、紫微斗数等更多法门即将上线</Text>
        <View className='coming-dots'>
          {['紫微斗数', '铁板神数', '太乙神数'].map(name => (
            <View key={name} className='coming-dot-item'>
              <View className='coming-dot' />
              <Text className='coming-dot-label'>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
