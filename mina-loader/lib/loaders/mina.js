const loaderUtils = require('loader-utils')

const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')
const resolve = (module) => require.resolve(module)

const helpers = require('../helpers')

const EXTNAMES = {
  template: 'wxml',
  style: 'wxss',
  script: 'js',
  config: 'json',
}

const TYPES_FOR_FILE_LOADER = ['template', 'style', 'config']
const TYPES_FOR_OUTPUT = ['script']

module.exports = function () {
  const done = this.async()

  const options = {}
  // 获取剩余请求资源的路径，也就是 xx.mina 的路径
  // 例如 /Users/jinzhanye/Desktop/dev/github/mini/mina-webpack/example/src/app.mina
  const url = loaderUtils.getRemainingRequest(this)

  // 前置 !! 表示只执行行内 loader，其他 loader 都不执行
  // 拼接上 parserLoader 的路径
  const parsedUrl = `!!${parserLoaderPath}!${url}`

  const loadModule = helpers.loadModule.bind(this)

  const getLoaderOf = (type, options) => {}



  loadModule(parsedUrl)
    .then((source) => {
      // parts 为以下对象
      // {
      //   config: {
      //     content: '.....'
      //   }
      //   wxml: {
      //     content: '.....'
      //   }
      //
      // }
      let parts = this.exec(source, parsedUrl)

      // 拼接 selector loader 路径
      // require("!!../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=script!./app.mina")
      let output = parts.script && parts.script.content ?
        TYPES_FOR_OUTPUT.map((type) => `require(${loaderUtils.stringifyRequest(this, `!!${getLoaderOf(type, options)}${selectorLoaderPath}?type=script!${url}`)})`).join(';') :
        ''

      return Promise.all(TYPES_FOR_FILE_LOADER.map((type) => {
        if (!parts[type] || !parts[type].content) {
          return Promise.resolve()
        }

        // dirname 为 '.'
        let dirname = compose(ensurePosix, helpers.toSafeOutputPath, path.dirname)(path.relative(this.options.context, url))
        // !!${resolve('file-loader')}?name=${dirname}/[name].${EXTNAMES[type]}!  => !!/Users/jinzhanye/Desktop/dev/github/mini/mina-webpack/example/node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].wxml!
        // ${getLoaderOf(type, options)}  =>  /Users/jinzhanye/Desktop/dev/github/mini/mina-webpack/example/node_modules/wxml-loader/lib/index.js?{"publicPath":"/"}!
        // ${selectorLoaderPath}?type=${type}!  =>  /Users/jinzhanye/Desktop/dev/github/mini/mina-webpack/example/node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=template!
        // url => /Users/jinzhanye/Desktop/dev/github/mini/mina-webpack/example/src/app.mina
        let request = `!!${resolve('file-loader')}?name=${dirname}/[name].${EXTNAMES[type]}!${getLoaderOf(type, options)}${selectorLoaderPath}?type=${type}!${url}`
        return loadModule(request)
      })).then(()=> {
        // 未清楚为什么 script 类型要等待其他类型 build module 完成后再回调，经测试其实不这么做也不会影响结果
        done(null, output)
      })
    })
}

