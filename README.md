# ak-webpack-plugin

Create zip package for ak platform


## Installation

```
npm i --save ak-webpack-plugin

npm i --save-dev ak-webpack-plugin
```

## Usage

``` javascript
var AkWebpackPlugin = require('ak-webpack-plugin');

// common config, webserver for html files and cdn for cnd files
plugins: [
	new AkWebpackPlugin({
	    "zipFileName": "build/offline",
	    "src": "build",
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

If you use this config, it would generate `offline` folder and `offline.zip`:

``` javascript
-- build
	|
	|- webserver
	|- cdn
	|- offline
	|- offline.zip
```

``` javascript

// config for multiple cdn files
plugins: [
	new AkWebpackPlugin({
	    "zipFileName": "offline",
        "src": "build",
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

## Options
* `zipFileName`
	- String, target offline file
* `src`
	- String, source folder
* `map` 
	- Array, detail source folder and url
* `isSameOrigin`
	- Boolean, default `false`
	- If set true, all other url would be the same with "webserver"


## Test
```
npm run test
```

## Changelog
* v1.0.0 zip and replace url to ensure same origin