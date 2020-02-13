import { pick, without, mapObject, values } from '../utils/functions'
import { prependHooks } from '../utils/helpers'
import * as wxOptionsGenerator from '../utils/wx-options-generator'
import Basic from './basic'
import globals from "../utils/globals";

// MINA_PAGE_OPTIONS、MINA_PAGE_HOOKS 区别在于 data 属性
const MINA_PAGE_OPTIONS = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']
const MINA_PAGE_HOOKS = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']

const ADDON_BEFORE_HOOKS = {
  'onLoad': 'beforeLoad',
}

// 原生 hooks + tina hooks
const PAGE_HOOKS = [...MINA_PAGE_HOOKS, ...values(ADDON_BEFORE_HOOKS)]

class Page extends Basic {
  static define(options = {}) {
    // use mixins
    options = this.mix(options)

    // create wx-Page options
    let page = {
      ...wxOptionsGenerator.methods(options.methods),
      // ...wxOptionsGenerator.lifecycles(
      //   MINA_PAGE_HOOKS.filter((name) => options[name].length),
      //   (name) => ADDON_BEFORE_HOOKS[name]
      // ),
    }

    // 对象合并，加一个全局 onLoad，在开发者的 onLoad 前执行
    page = prependHooks(page, {
      onLoad() {
        // this 是小程序 page 实例
        // instance 是这个 Page Class 的实例
        let instance = new Page({ options, $source: this })
        // 建立关联
        this.__tina_instance__ = instance
        instance.$source = this
      }
    })

    new globals.Page({
      // without 结果为 ['data']，所以 pick 结果就是开发者的 data 对象, {data:{/**/}}
      ...pick(options, without(MINA_PAGE_OPTIONS, MINA_PAGE_HOOKS)),
      ...page,
    })
  }

  constructor({ options = {} }) {
    super()
    // 在 page 中添加 methods、beforeLoad 及除了 data 以外的属性
    let members = {
      compute: options.compute || function () {
        return {}
      },
      ...options.methods,
      ...mapObject(pick(options, PAGE_HOOKS), () => function (...args) {
        // todo
      }),
    }

    // apply members into instance
    for (let name in members) {
      this[name] = members[name]
    }

    return this
  }

  get data() {
    return this.$source.data
  }
}

export default Page