function addHooks (context, handlers, isPrepend = false) {
  let result = {}
  for (let name in handlers) {
    result[name] = function handler (...args) {
      if (isPrepend) { // onLoad
        handlers[name].apply(this, args)
      }
      if (typeof context[name] === 'function') {
        context[name].apply(this, args)
      }
      if (!isPrepend) {
        handlers[name].apply(this, args)
      }
    }
  }
  return {
    ...context,
    ...result,
  }
}

export const prependHooks = (context, handlers) => addHooks(context, handlers, true)

