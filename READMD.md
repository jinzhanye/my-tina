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
