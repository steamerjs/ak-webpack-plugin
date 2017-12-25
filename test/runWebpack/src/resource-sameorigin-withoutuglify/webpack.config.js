const path = require('path'),
      fs = require('fs');

var webpack = require('webpack'),
	config = require('../../config/config'),
	nodeModulesPath = path.resolve('../node_modules');

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
    AkWebpackPlugin = require('../../../../index');

var webpackConfig = {
    context: config.path.src,
	entry: {
        'libs/react': [path.join(config.path.src, "/resource-sameorigin-withoutuglify/libs/react")],
        'index': [path.join(config.path.src, "/resource-sameorigin-withoutuglify/index")],
    },
    output: {
        publicPath: config.cdn,
        path: path.join(config.path.dist + '/resource-sameorigin-withoutuglify/cdn/'),
        filename: "js/[name].js",
        chunkFilename: "chunk/[name].js",
        crossOriginLoading: "anonymous"
    },
    module: {
        rules: [
            { 
                test: /\.js?$/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: false,
                    presets: [
                        'es2015', 
                    ]
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader', 
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                localIdentName: '[name]-[local]-[hash:base64:5]',
                            }
                        }
                    ]
                }),
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 1,
                            name: "img/[path]/[name].[ext]",
                            publicPath: "//localhost:7000/"
                        }
                    }
                ],
                include: path.resolve(config.path.src)
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
        ],
    },
    resolve: {
        modules: [
            config.path.src,
            "node_modules",
        ],
        extensions: [".js", ".jsx", ".css", ".scss", ".less", ".styl", ".png", ".jpg", ".jpeg", ".ico", ".ejs", ".pug", ".handlebars", "swf"],
        alias: {}
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin({filename: "./css/[name].css",
            // publicPath: "//localhost:1111/",
        }),
        new HtmlResWebpackPlugin({
            mode: 'html',
        	filename: "../webserver/entry.html",
	        template: config.path.src + "/resource-sameorigin-withoutuglify/index.html",
            // cssPublicPath: "//localhost:1111/",
	        htmlMinify: null
        }),
        new AkWebpackPlugin({
            "zipFileName": "test/runWebpack/dist/resource-sameorigin-withoutuglify/offline",
            "src": "test/runWebpack/dist/resource-sameorigin-withoutuglify/",
            "keepOffline": true,
            "map": [
                {
                    "src": "webserver",
                    "isWebserver": true,
                    "url": config.defaultPath,
                },
                {
                    "src": "cdn/js",
                    "dest": "js",
                    "isSameOrigin": true,
                    "url": config.cdn
                },
                {
                    "src": "cdn/css",
                    "dest": "css",
                    "url": config.cdn
                },
                {
                    "src": "cdn/img",
                    "dest": "img",
                    "url": config.cdn,
                    "exclude": ["img"]
                }
            ],
            beforeCopy: function() {
                this.info("======beforeCopy=====");
                fs.writeFileSync(path.resolve("test/runWebpack/dist/resource-sameorigin-withoutuglify/cdn/js/detail.js"), "hello man!", "utf-8");
            },
            afterCopy: function() {
                this.info("======afterCopy=====");
                fs.writeFileSync(path.resolve("test/runWebpack/dist/resource-sameorigin-withoutuglify/cdn/js/comment.js"), "hello man!", "utf-8");
            },
            beforeZip: function(files) {
                this.info("======beforeZip=====");
                this.info(files);
            },
            afterZip: function(zipFilePath) {
                this.info(`======afterZip=====`);
                this.info(zipFilePath);
            }
        })
    ],
    watch: false,
};

module.exports = webpackConfig;