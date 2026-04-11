export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/yijing/index',
    'pages/daily/index',
    'pages/tarot/index',
    'pages/qimen/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#1a1625',
    navigationBarTitleText: '天机阁',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#888',
    selectedColor: '#a78bfa',
    backgroundColor: '#1e1a2e',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/yijing/index', text: '易经' },
      { pagePath: 'pages/daily/index', text: '运势' },
      { pagePath: 'pages/tarot/index', text: '塔罗' },
      { pagePath: 'pages/qimen/index', text: '奇门' },
    ],
  },
})
