function addHooks (context, handlers, isPrepend = false) {
  let result = {}
  for (let name in handlers) {
    // 改写 hook 方法
    result[name] = function handler (...args) {
      // 小程序运行时, this 是开发者写的 options 也就是 wx-page
      if (isPrepend) {
        // 执行 tina 追加的 onLoad
        handlers[name].apply(this, args)
      }
      if (typeof context[name] === 'function') {
        // 执行真正的 onLoad
        context[name].apply(this, args)
      }
      // ...
    }
  }
  return {
    ...context,
    ...result,
  }
}

/**
 * 在 wx-page 生命周期勾子前追加勾子
 * @param {Object} context
 * @param {Array} handlers
 * @return {Object}
 */
export const prependHooks = (context, handlers) => addHooks(context, handlers, true)

export function linkProperties ({ TargetClass, getSourceInstance, properties }) {
  properties.forEach((name) => {
    Object.defineProperty(TargetClass.prototype, name, {
      set: function (value) {
        let context = getSourceInstance(this)
        context[name] = value
      },
      get: function () {
        // context 是 wx-Page/wx-Component 对象
        let context = getSourceInstance(this)
        let member = context[name]
        if (typeof member === 'function') {
          return member.bind(context)
        }
        return member
      },
    })
  })
  return TargetClass
}
