const path = require('path');

var webpack = require('webpack'),
	config = require('../../config/config'),
	nodeModulesPath = path.resolve('../node_modules');

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin"),
    AkWebpackPlugin = require('../../../../index');

var webpackConfig = {
    context: config.path.src,
	entry: {
        'libs/react': [path.join(config.path.src, "/resource-sameorigin/libs/react")],
        'index': [path.join(config.path.src, "/resource-sameorigin/index")],
    },
    output: {
        publicPath: config.cdn,
        path: path.join(config.path.dist + '/resource-sameorigin/cdn/'),
        filename: "js/[name].js",
        chunkFilename: "chunk/[name].js",
    },
    module: {
        rules: [
            { 
                test: /\.js?$/,
                loader: 'babel-loader',
                query: {
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
                    "url-loader?limit=1000&name=img/[path]/[name].[ext]",
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
	        template: config.path.src + "/resource-sameorigin/index.html",
            // cssPublicPath: "//localhost:1111/",
	        htmlMinify: null
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new AkWebpackPlugin({
            "zipFileName": "test/runWebpack/dist/resource-sameorigin/offline",
            "src": "test/runWebpack/dist/resource-sameorigin/",
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
            ]
        })
    ],
    watch: false,
};

module.exports = webpackConfig;