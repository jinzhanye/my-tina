function initial() {
  // 为了初始化 computed 属性
  this.setData()
  this.$log('Initial Mixin', 'Ready')
}

// builtin log mixin for Tina-Page
function log() {
  // 为上下文新增 $log 方法
  // this.constructor.log 为 Basic.log
  this.$log = this.constructor.log.bind(this.constructor)
  this.$log('Log Mixin', 'Ready')
}


export const $log = {
  created: log, // 组件中，created 之后是 attached
  beforeLoad: log,// 页面中，beforeLoad（tina追加的生命周期勾子） 之后是 onLoad
}

// builtin initial mixin for Tina-Page
export const $initial = {
  attached: initial,// 组件创建完成生命周期
  onLoad: initial,// 页面加载完成生命周期
}

// {
//   // 组件生命周期勾子
//   created:[log],
//   attached:[initial],
//   // 页面生命周期勾子
//   beforeLoad:[log],
//   onLoad:[initial],
// }


// const d = {
//   // 页面
//   beforeLoad: [$log.beforeLoad, options.beforeLoad],
//   onLoad: [$initial.onLoad, options.onLoad],
//
//   onHide: [],
//   onPageScroll: [],
//   onPullDownRefresh: [],
//   onReachBottom: [],
//   onReady: [],
//   onShareAppMessage: [],
//   onShow: [],
//   onUnload: [],
//   // 组件
//   attached: Function,
//   compute: Function,
//   created: $log.created,
//   // 共有
//   data: options.data,
//   methods: options.methods,
//   mixins: [],
// }
