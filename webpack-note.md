## plugin
###  mina-entry-webpack-plugin
解析 app.mina config 中的 pages，然后将依赖的 pages 和 components 加到 entry 

```
{
  entry: './app.mina',
}
// entry 转换成以下对象
{
  entry: {
    'app.js' : './app.mian'
    'pages/home.js' : './pages/home.mina'
  }
}
```

### mina-runtime-webpack-plugin
在 chunk 开头添加依赖 chunk require 

## loader
重点在 loader

### mina-loader 分析
从 test.js 的 basic 用例可以看出，解析 .mina 文件，输出 .js、.wxml、.json、.wxss  4 个文件

- mina 调用 loader.loadModule，然后？
- parser 将 .mina 文件转换成 'module.exports={config:{},template:'',script:'',style:''}'
- mina-json-file 解析 app.json/component.json 里的配置路径
- selector 调用 loader.loadModule，然后？

[0] ./src/index.js 437 {0} [built]
[3] ./src/index.less 188 {0} [not cacheable] [built] insertHtml style-loader
[4] ./loaders/css-loader.js!./loaders/less-loader.js!./src/index.less 102 {0} [not cacheable] [built] export htmlList css-loader

     Asset       Size  Chunks             Chunk Names
./app.json   18 bytes          [emitted]  
./app.wxml   24 bytes          [emitted]  
./app.wxss   28 bytes          [emitted]  
    app.js  314 bytes       0  [emitted]  app.js
 common.js    5.76 kB       1  [emitted]  common.js


[0] ./app.mina 95 bytes {0} [built]
[1] ../node_modules/@tinajs/mina-loader/lib/loaders/parser.js!./app.mina 390 bytes [built] 
[2] ../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=script!./app.mina 66 bytes {0} [built]
[3] ../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].json!../node_modules/@tinajs/mina-loader/lib/loaders/mina-json-file.js?{"publicPath":"/"}!../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=config!./app.mina 56 bytes [built]
[4] ../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].wxml!../node_modules/wxml-loader/lib?{"publicPath":"/"}!../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=template!./app.mina 56 bytes [built]
[5] ../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].wxss!../node_modules/extract-loader/lib/extractLoader.js?{"publicPath":"/"}!../node_modules/css-loader!../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=style!./app.mina 56 bytes [built]


[1] parser loader, 输出 'module.exports={config:{},template:'',script:'',style:''}'

#### js
../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=script
!./app.mina 66 bytes {0}

selector-loader 单独抽出一个type的配置，不需要使用 file-loader

#### json
../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].json
../node_modules/@tinajs/mina-loader/lib/loaders/mina-json-file.js?{"publicPath":"/"}
../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=config
./app.mina 56 bytes [built]

selector-loader 单独抽出一个type的配置 -> mina-json-file 解析 json 路径 -> file-loader 输出文件

#### wxml
 ../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].wxml
 ../node_modules/wxml-loader/lib?{"publicPath":"/"}
 ../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=template
 ./app.mina 56 bytes [built]
 
selector-loader 单独抽出一个type的配置 -> wxml-loader -> file-loader 输出文件

#### wxss
../node_modules/@tinajs/mina-loader/node_modules/file-loader/dist/cjs.js?name=./[name].wxss!
../node_modules/extract-loader/lib/extractLoader.js?{"publicPath":"/"}!
../node_modules/css-loader!
../node_modules/@tinajs/mina-loader/lib/loaders/selector.js?type=style!
./app.mina 56 bytes [built]

parser-loader -> selector-loader 单独抽出一个type的配置 -> css-loader -> extract-loader -> file-loader 输出文件





