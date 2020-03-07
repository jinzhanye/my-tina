# tinaJs 源码分析

## 是什么

对 Component、Page 进行封装，主要 Page.define 做了什么。

```js
class Page extends Basic {
  static mixins = []
  static define(options = {}) {
    options = this.mix(/*....*/)
    let page = {/*.....*/}
    page = prependHooks(page, {
      
    })
  }
  get data() {
   return this.$source.data
  }
}
```

代码书写顺序

1. 选项合并，也就是 mixin
1. 在原来的生命周期勾子里追加 beforeLoad 勾子
1. 将方法、生命周期勾子的执行上下文变成 tina-page
1. 方法代理，所有 wx-page 的所有方法、生命周期勾子代理给 tina-page
1. 添加 wx-page、tina-page

以下代码执行顺序来讲解

## mix
```js
options = this.mix(PAGE_INITIAL_OPTIONS, [...BUILTIN_MIXINS, ...this.mixins, ...(options.mixins || []), options])
```

tina 1.0 只支持一种合并策略，

- 对于 methods 就是后进的覆盖前面的
- 对于生命周期勾子和特殊勾子（onPullDownRefresh 等），就是变成一个数组，后进的先执行

也就是 options.mixins > Page.mixins（全局 mixin） > BUILTIN_MIXINS。

mix 后可以得到这样一个对象

```
{
  // 页面
  beforeLoad: [$log.beforeLoad, options.beforeLoad],
  onLoad: [$initial.onLoad, options.onLoad],
  onHide: [],
  onPageScroll: [],
  onPullDownRefresh: [],
  onReachBottom: [],
  onReady: [],
  onShareAppMessage: [],
  onShow: [],
  onUnload: [],
  // 组件
  attached: Function,
  compute: Function,
  created: $log.created,
  // 页面、组件共用
  data: options.data,
  methods: options.methods,
  mixins: [],
}
```

接下来是创建原生 page 对象（以下称 wx-Page，而 tina 的 page 对象称 tina-page），先看看创建后的 page 对象

## 关联 wx-Page、tina-Page
为了绑定 wx-Page 对象，在 wx-onLoad 前追加一个 onLoad。
prependHooks 是作用是在 page[hookName] 执行前或执行后执行 handlers[hookName]，并且将 handlers[hookName] 的执行上下文改成 page

```js
wxPageOptions = prependHooks(wxPageOptions, {
      onLoad() {
        // this 是 wxPageOptions
        // instance 是这个 Page Class 的实例
        let instance = new Page({ tinaPageOptions })
        // 建立关联
        this.__tina_instance__ = instance
        instance.$source = this
      }
    })
```

## 代理
```js
  constructor({ options = {} }) {
    super()
    // 创建 wx-page options
    let members = {
      // compute 是 tina 添加的方法
      compute: options.compute || function () {
        return {}
      },
      ...options.methods,
      // 用于代理所有生命周期（包括 tina 追加的 beforeLoad）
      ...mapObject(pick(options, PAGE_HOOKS), (handlers) => {
        return function (...args) {
          // 因为做过 mixin 处理，一个生命周期会有多个处理方法
          return handlers.reduce((memory, handler) => {
            const result = handler.apply(this, args.concat(memory))
            return result
          }, void 0)
        }
      }),
      // 以 beforeLoad、onLoad 为例，以上 mapObject 后追加的生命周期处理方法实际执行时是这样的
      // beforeLoad(...args) {
      //  return [onLoad1、onLoad2、.....].reduce((memory, handler) => {
      //    return handler.apply(this, args.concat(memory))
      //  }, void 0)
      //},
      // onLoad(...args) {
      //   return [onShow1、onShow2、.....].reduce((memory, handler) => {
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
```

new Page，因为 wx-page options 的 methods 和 hooks 都是在 options 的第一层的，所以需要将将 methods 和 hooks 铺平。
又因为 hooks 经过 mixins 处理已经变成了数组，所以需要遍历执行。每个 hooks 的第二个参数都是之前累积的结果。最后通过简单的属性拷贝将所有方法代理到 tina-page。

## 改变执行上下文
```js
let wxPageOptions = {
   ...wxOptionsGenerator.methods(tinaPageOptions.methods),
   ...wxOptionsGenerator.lifecycles(
     inUseOptionsHooks,
     (name) => ADDON_BEFORE_HOOKS[name]
   ),
 }
 // ....
new globals.Page({
  // ..
  ...wxPageOptions,
})
```

实际上所有封装都是建立在 `tinaPageOptions` 的，那么当 `wxPageOptions` 里的 methods 执行时怎样才能将控制权转移到 `tinaPageOptions`，答案就在 `wxOptionsGenerator.methods`

```js
/**
 * wxPageOptions.methods 中的改变执行上下文为 tina.Page 对象
 * @param {Object} object
 * @return {Object}
 */
export function methods(object) {
  return mapObject(object || {}, (method, name) => function handler(...args) {
    let context = this.__tina_instance__
    return context[name].apply(context, args)
  })
}
```

上面说过在 `onLoad` 的时候会绑定 `__tina_instance__` 到 wx-page，同时wxPageOptions 有的东西 tinaPageOptions 也都有，所以可以转发调用。
那么开发者在 `methods` 拿到的 `this` 是 `__tina_instance__`，有这个设定，就相当于 tina 在 wx 之上做了一个抽象层。所有主动调用都先经过 tina 再到 wx，
所有被动调用都经过 tina 处理。

不改变

执行顺序是 wx.onLoad -> tina.beforeLoad -> tina.onLoad（也就是开发者的 options.onLoad）

那么 beforeLoad 有什么用呢，举个例子

只要有拦截就可以做很多事情
wx | 中间层 | tina
tina | 中间层 | wx

## 追加生命周期勾子
```js
/**
 * options.methods 中的改变执行上下文为 tina.Page 对象
 * @param {Array} hooks
 * @param {Function} getBeforeHookName
 * @return {Object}
 */
export function lifecycles(hooks, getBeforeHookName) {
  return fromPairs(hooks.map((origin) => {
    let before = getBeforeHookName(origin) // 例如 'beforeLoad'
    return [
      origin, // 例如 'load'
      function wxHook() {
        let context = this.__tina_instance__
        // 调用 tina-page 的方法，例如 beforeLoad
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
```

`wxHook` 上下文是 wxPageOptions，之后改变上下文执行 tina 相对应的 hook。

```
addHooks.handler -> wx-Page.onLoad，关联 wx-Page、tinaPage -> 回到 addHooks.handler -> lifecycles.wxHook -> tina-Page.beforeLoad -> tina-Page.onLoad
```

## compute 实现原理
因为运行时的上下文都被 tina 改为 tina-Page，所以开发者调用的 `this.setData`， 实际上的 tina-Page 的 `setData` 方法，又因为 tina-Page 继承自 Basic，也就调用 Basic 的 setData 方法。下面看看 `setData` 的源码

```js
setData(newer, callback = () => {}) {
  let next = { ...this.data, ...newer }
  if (typeof this.compute === 'function') {
    next = {
      ...next,
      ...this.compute(next),
    }
  }
  next = diff(next, this.data)
  this.constructor.log('setData', next)
  if (isEmpty(next)) {
    return callback()
  }
  this.$source.setData(next, callback)
}
```

从源码可以看到就是每次 `setData` 的时候调用一下 `compute` 更新数据。这是 `compute`  的原理，很容易理解吧。

前面 mixins 小节提到，tina 会合并一些内置选项，可以看到在 `onLoad` 时会调用一下 `this.setData`，为了初始化 compute 属性。

```js
// mixins/index.js

function initial() {
  // 为了初始化 compute 属性
  this.setData()
  this.$log('Initial Mixin', 'Ready')
}

export const $initial = {
  // ...
  onLoad: initial,// 页面加载完成勾子
}
```
