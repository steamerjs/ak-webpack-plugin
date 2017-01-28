# ak-webpack-plugin

AlloyKit平台生成离线包命令


## 安装

```
npm i --save ak-webpack-plugin

npm i --save-dev ak-webpack-plugin
```

##  使用

``` javascript
var AkWebpackPlugin = require('ak-webpack-plugin');

// 通用配置，webserver 针对 html 文件，而 cdn 是针对 cdn 文件
plugins: [
	new AkWebpackPlugin({
	    "zipFileName": "dist/offline",
	    "src": "dist",
	    "isSameOrigin": true,
	    "map": [
	        {
	            "src": "webserver",
	            "url": "//localhost:9000/"
	        },
	        {
	            "src": "cdn",
	            "url": "//localhost:8000/"
	        }
	    ]
	})
]

```

如果你使用上述的配置，它会在 `dist` 目录下，生成 `offline` 文件夹和 `offline.zip` 文件：

``` javascript
-- dist
	|
	|- webserver
	|- cdn
	|- offline
	|- offline.zip
```

``` javascript

// 多个cdn文件配置
plugins: [
	new AkWebpackPlugin({
	    "zipFileName": "offline",
        "src": "dist",
        "isSameOrigin": "false",
        "map": [
        {
            "src": "cdn/js",
            "url": "s1.url.cn/huayang/"
        },
        {
            "src": "cdn/css",
            "url": "s2.url.cn/huayang/"
        },
        {
            "src": "cdn/img",
            "url": "s3.url.cn/huayang/"
        },
        {
            "src": "cdn/lib",
            "url": "s3.url.cn/huayang/"
        },
        {
            "src": "webserver",
            "url": "huayang.qq.com/huayang/activity/"
        }
	})
]

```

## 配置
* `zipFileName`
	- String, 最终生成的离线包名称，默认值是 `offline`，**当前文件夹位置以命令执行位置为基准**
* `src`
	- String, 生成环境的代码源，默认值 `dist`
* `map` 
	- Array, detail source folder and url
* `isSameOrigin`
	- Boolean, 默认值 `false`
	- 如果设置为 `true` 会将 `cdn` 的 `url`，全部替换成 `webserver` 的 `url`


## 测试
```
npm run test
```

## 变更
* v1.0.0 离线包打包及 `webserver` 替换 `cdn` 的 `url`
* v1.0.1 更换成中文文档