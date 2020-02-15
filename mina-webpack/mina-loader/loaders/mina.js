const loaderUtils = require('loader-utils')

const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')

const helpers = require('../helpers')

const TYPES_FOR_FILE_LOADER = ['template', 'style', 'config']
const TYPES_FOR_OUTPUT = ['script']

module.exports = function () {
  const done = this.async()

  const options = {}

  const url = loaderUtils.getRemainingRequest(this)
  const parsedUrl = `!!${parserLoaderPath}!${url}`

  const loadModule = helpers.loadModule.bind(this)

  const getLoaderOf = (type, options) => {}

  loadModule(parsedUrl)
    .then((source) => {
      // parts 为以下对象
      // {
      //   wxml: {
      //     content: '.....'
      //   }
      //   .....
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


      })).then(()=> {
        // 返回 script 类型文件的请求
        done(null, output)
      })
    })
}
