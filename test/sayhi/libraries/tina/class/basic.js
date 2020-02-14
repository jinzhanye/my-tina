import { isEmpty, pick, mapObject, filterObject } from '../utils/functions'
import strategies from '../utils/mix-strategies'

class Basic {
  static mixins = []

  /**
   * options.methods 中的改变执行上下文为 tina.Page 对象
   * @param {Object} options
   * @param {Array || Function} mixins
   * @return {Object}
   */
  static mix(options, mixins) {
    if (Array.isArray(mixins)) {
      return mixins.reduce((memory, mixin) => {
        return this.mix(memory, mixin)
      }, options)
    }

    if (typeof mixins === 'function') {
      return this.mix(options, mixins(options, this))
    }
    let mixin = mixins
    return {
      ...options,
      ...mapObject(mixin, (extra, key) => strategies.merge(options[key], extra)),
    }
  }

  get data() {
    throw new Error('class Basic doesnot have a ``data`` atttribute, please implement the ``data`` getter in the child-class.')
  }

  setData(newer, callback = () => {}) {
    let next = { ...this.data, ...newer }
    if (typeof this.compute === 'function') {
      next = {
        ...next,
        ...this.compute(next),
      }
    }
    next = diff(next, this.data)
    // log...
    if (isEmpty(next)) {
      return callback()
    }
    this.$source.setData(next, callback)
  }
}

function diff(newer, older) {
  let result = {}
  for (let key in newer) {
    if (newer[key] !== older[key]) {
      result[key] = newer[key]
    }
  }
  return result
}

export default Basic
