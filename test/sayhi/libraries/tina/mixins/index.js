function initial() {
  // 为了初始化 computed 属性
  this.setData()
  this.$log('Initial Mixin', 'Ready')
}

// builtin initial mixin for Tina-Page
export const $initial = {
  attached: initial,// 组件创建完成生命周期
  onLoad: initial,// 页面加载完成生命周期
}

// builtin log mixin for Tina-Page
function log() {
  // 为上下文新增 $log 方法
  // this.constructor.log 为 Basic.log
  this.$log = this.constructor.log.bind(this.constructor)
  this.$log('Log Mixin', 'Ready')
}

export const $log = {
  created: log,
  beforeLoad: log,
}
