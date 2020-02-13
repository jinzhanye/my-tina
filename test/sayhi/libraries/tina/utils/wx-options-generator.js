import { mapObject, fromPairs } from './functions'

/**
 * options.methods 中的改变执行上下文为 tina.Page 对象
 * @param {Object} object
 * @return {Object}
 */
export function methods(object) {
  return mapObject(object || {}, (method, name) => function handler(...args) {
    let context = this.__tina_instance__
    return context[name].apply(context, args)
  })
}

// 追加 beforeX 生命周期
export function lifecycles(hooks, getBeforeHookName) {
  return fromPairs(hooks.map((origin) => {
    let before = getBeforeHookName(origin) // 'beforeLoad'
    return [
      origin, // 'load'
      function () {
        let context = this.__tina_instance__
        // 调用 tina-page 的方法
        if (before && context[before]) {
          context[before].apply(context, arguments)
        }
        if (context[origin]) {
          return context[origin].apply(context, arguments)
        }
      }
    ]
  }))
}
