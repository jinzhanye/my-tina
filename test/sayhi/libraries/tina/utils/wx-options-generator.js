import { mapObject, fromPairs } from './functions'

// generate methods，改变执行上下文为 tina.Page 对象
export function methods (object) {
  return mapObject(object || {}, (method, name) => function handler (...args) {
    let context = this.__tina_instance__
    return context[name].apply(context, args)
  })
}

// generate lifecycles
export function lifecycles (hooks, getBeforeHookName) {
  return hooks
}
