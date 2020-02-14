function initial() {
  // 为了初始化 computed 属性
  this.setData()
}

export const $initial = {
  attached: initial,// 组件创建完成生命周期
  onLoad: initial,// 页面加载完成生命周期
}
