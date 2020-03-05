build tina step by step

## 总体流程
- startup
- Page.define config
- component config

### page
- add Page.define
- add options.methods
- add options.compute
- add beforeLoad life circle

## 问题
- 为什么要在生命周期外部包一层数组，应该是 mix 的时候用

```
const PAGE_INITIAL_OPTIONS = {
  mixins: [],
  data: {},
  compute() {},
  // hooks: return { beforeLoad: [], ...... }
  ...fromPairs(PAGE_HOOKS.map((name) => [name, []])),
  methods: {},
}
```


## Page.define
mixin，内置的 mixin，比如 log、initial，

```
{
  // 组件生命周期勾子
  created:[log],
  attached:[initial],
  // 页面生命周期勾子
  beforeLoad:[log],
  onLoad:[initial],
}
```

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
  // 共有
  data: options.data,
  methods: options.methods,
  mixins: [],
}
```

接下来是创建原生 page 对象（以下称 wx-page，而 tina 的 page 对象称 tina-page），先看看创建后的 page 对象

```
{
  ask: Function,
  sayHi: Function,
  onLoad: Function,
}
```

`wxOptionsGenerator.methods` 将 options.methods 的执行上下文变成 tina-page。wxOptionsGenerator.lifecycles 则在 onLoad 前追加 beforeLoad 生命周期
```
let page = {
  ...wxOptionsGenerator.methods(options.methods),
  ...wxOptionsGenerator.lifecycles(
    optionsHooks,
    (name) => ADDON_BEFORE_HOOKS[name]
  ),
 }
```

为了绑定 wx-page 对象，在原生 onLoad 前追加 onLoad。这个 onLoad 是第一个执行的 onLoad，比 tina 追加的 beforeLoad 还要先执行

```
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
```

执行顺序是 wx.onLoad -> tina.beforeLoad -> tina.onLoad（也就是开发者的 options.onLoad）






## compute 实现原理
