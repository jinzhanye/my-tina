function addHooks (context, handlers, isPrepend = false) {
  let result = {}
  for (let name in handlers) {
    result[name] = function handler (...args) {
      // 小程序运行时, this 是小程序的 this
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

export const prependHooks = (context, handlers) => addHooks(context, handlers, true)

