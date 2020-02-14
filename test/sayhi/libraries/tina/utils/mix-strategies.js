export default {
  merge: function (source, extra) {
    if (Array.isArray(source)) {
      return source.concat(extra)
    }
    if (typeof source === 'object') {
      return {
        ...source,
        ...extra,// mixin 进行的属性优化级比 options 中的属性要高
      }
    }
    return extra
  }
}
