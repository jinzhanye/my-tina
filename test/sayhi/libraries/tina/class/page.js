import { $initial, $log } from '../mixins/index'
import { pick, without, mapObject, values, fromPairs } from '../utils/functions'
import { prependHooks, linkProperties } from '../utils/helpers'
import * as wxOptionsGenerator from '../utils/wx-options-generator'
import Basic from './basic'
import globals from "../utils/globals";

// MINA_PAGE_OPTIONS、MINA_PAGE_HOOKS 区别在于 data 属性
const MINA_PAGE_OPTIONS = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']
const MINA_PAGE_HOOKS = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']
const MINA_PAGE_METHODS = ['setData']
const MINA_PAGE_ATTRIBUTES = ['data', 'route']

const ADDON_BEFORE_HOOKS = {
  'onLoad': 'beforeLoad',
}

// 被 tina 重写的方法与属性
const OVERWRITED_METHODS = ['setData']
const OVERWRITED_ATTRIBUTES = ['data']

// 原生 hooks + tina hooks
const PAGE_HOOKS = [...MINA_PAGE_HOOKS, ...values(ADDON_BEFORE_HOOKS)]

const PAGE_INITIAL_OPTIONS = {
  mixins: [],
  data: {},
  compute() {},
  // hooks: return { beforeLoad: [], ...... }
  ...fromPairs(PAGE_HOOKS.map((name) => [name, []])),
  methods: {},
}

const BUILTIN_MIXINS = [$log, $initial]

class Page extends Basic {
  static mixins = []

  static define(options = {}) {
    // use mixins
    // this 是 function Page(){xxx}，因为 define 是这样被调用的 Page.define
    options = this.mix(PAGE_INITIAL_OPTIONS, [...BUILTIN_MIXINS, ...this.mixins, ...(options.mixins || []), options])

    // 过滤出 options 中使用的生命周期的名称
    const optionsHooks = MINA_PAGE_HOOKS.filter((name) => {
      return options[name].length
    })

    // create wx-Page options
    let page = {
      ...wxOptionsGenerator.methods(options.methods),
      ...wxOptionsGenerator.lifecycles(
        optionsHooks,
        (name) => ADDON_BEFORE_HOOKS[name]
      ),
    }
    // 对象合并，加一个全局 onLoad
    // handlers.onLoad -> 上面的 page 变量的 onLoad -> tina-page.onLoad（开发者 options 里的 onload）
    // 注意 prependHooks 追加的处理方法的执行上下文是 wx-page
    page = prependHooks(page, {
      onLoad() {
        // this 是小程序 page 实例
        // instance 是这个 Page Class 的实例
        let instance = new Page({ options })
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
      // 用于代理所有生命周期
      ...mapObject(pick(options, PAGE_HOOKS), (handlers) => {
        return function (...args) {
          // 因为做过 mixin 处理，一个生命周期会有多个处理方法
          return handlers.reduce((memory, handler) => {
            const result = handler.apply(this, args.concat(memory))
            return result
          }, void 0)
        }
      }),
      // 以上 mapObject 后追加的生命周期处理方法实际执行时是这样的
      // onLoad(...args) {
      //   return handlers.reduce((memory, handler) => {
      //     return handler.apply(this, args.concat(memory))
      //   }, void 0)
      // },
    }

    // tina-page 代理所有属性
    for (let name in members) {
      this[name] = members[name]
    }

    return this
  }

  get data() {
    return this.$source.data
  }
}

// 将没被 tina  改写的方法、属性全部代理到 tina，调用这些属性/方法时再转发回原 wx 对象处理
linkProperties({
  TargetClass: Page,
  getSourceInstance(context) {
    return context.$source
  },
  // properties: ['route']
  properties: [...without(MINA_PAGE_ATTRIBUTES, OVERWRITED_ATTRIBUTES), ...without(MINA_PAGE_METHODS, OVERWRITED_METHODS)],
})

export default Page
