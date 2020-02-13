// import { $initial, $log } from '../mixins'
import { mapObject, filterObject, pick, without, values, fromPairs } from '../utils/functions'
import { prependHooks, linkProperties, appendHooks } from '../utils/helpers'
import * as wxOptionsGenerator from '../utils/wx-options-generator'
import globals from '../utils/globals'
import Basic from './basic'

const MINA_PAGE_OPTIONS = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']
const MINA_PAGE_HOOKS = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll']
const MINA_PAGE_METHODS = ['setData']
const MINA_PAGE_ATTRIBUTES = ['data', 'route']

const ADDON_BEFORE_HOOKS = {
  'onLoad': 'beforeLoad',
}
const ADDON_OPTIONS = ['mixins', 'compute', 'methods', 'beforeLoad']

const OVERWRITED_METHODS = ['setData']
const OVERWRITED_ATTRIBUTES = ['data']

const PAGE_HOOKS = [...MINA_PAGE_HOOKS, ...values(ADDON_BEFORE_HOOKS)]

const PAGE_INITIAL_OPTIONS = {
  mixins: [],
  data: {},
  compute () {},
  // hooks: return { beforeLoad: [], ...... }
  ...fromPairs(PAGE_HOOKS.map((name) => [name, []])),
  methods: {},
}

// const BUILTIN_MIXINS = [$log, $initial]

class Page extends Basic {
  // static mixins = []

  static define (options = {}) {
    // use mixins
    options = this.mix(PAGE_INITIAL_OPTIONS, [ ...this.mixins, ...(options.mixins || []), options])
    // create wx-Page options
    let page = {
      ...wxOptionsGenerator.methods(options.methods),
      ...wxOptionsGenerator.lifecycles(MINA_PAGE_HOOKS.filter((name) => options[name].length > 0), (name) => ADDON_BEFORE_HOOKS[name]),
    }

    // creating Tina-Page on **wx-Page** loaded.
    // !important: this hook is added to wx-Page directly, but not Tina-Page
    page = prependHooks(page, {
      onLoad () {
        let instance = new Page({ options, $source: this })
        // create bi-direction links
        this.__tina_instance__ = instance
        instance.$source = this
      },
    })

    // apply wx-Page options
    new globals.Page({
      ...pick(options, without(MINA_PAGE_OPTIONS, MINA_PAGE_HOOKS)),
      ...page,
    })
  }

  constructor ({ options = {}, $source }) {
    super()

    // creating Tina-Page members
    let members = {
      compute: options.compute || function () {
        return {}
      },
      ...options.methods,
      // hooks
      ...mapObject(pick(options, PAGE_HOOKS), (handlers, name) => function (...args) {
        return handlers.reduce((memory, handler) => handler.apply(this, args.concat(memory)), void 0)
      }),
    }
    // apply members into instance
    for (let name in members) {
      this[name] = members[name]
    }

    return this
  }

  get data () {
    return this.$source.data
  }
}

// link the rest of wx-Component attributes and methods to Tina-Component
linkProperties({
  TargetClass: Page,
  getSourceInstance (context) {
    return context.$source
  },
  properties: [...without(MINA_PAGE_ATTRIBUTES, OVERWRITED_ATTRIBUTES), ...without(MINA_PAGE_METHODS, OVERWRITED_METHODS)],
})

export default Page
