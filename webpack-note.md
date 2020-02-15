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

- mina-loader 解析 .mina 文件，输出什么？
  - mina 调用 loader.loadModule，然后？
  - parser 将 .mina 文件转换成 'module.exports={config:{},template:'',script:'',style:''}'
  - mina-json-file 解析 app.json/component.json 里的配置路径
  - selector 调用 loader.loadModule，然后？
