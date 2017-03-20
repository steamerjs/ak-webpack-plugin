const path = require('path');

var webpack = require('webpack'),
	config = require('../../config/config'),
	nodeModulesPath = path.resolve('../node_modules');

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin-steamer"),
    AkWebpackPlugin = require('../../../index');

var webpackConfig = {
	entry: {
        'libs/react': [path.join(config.path.src, "/resource-sameorigin-withoutuglify/libs/react")],
        'index': [path.join(config.path.src, "/resource-sameorigin-withoutuglify/index")],
    },
    output: {
        publicPath: config.cdn,
        path: path.join(config.path.dist + '/resource-sameorigin-withoutuglify/cdn/'),
        filename: "js/[name].js",
        chunkFilename: "chunk/[name].js",
    },
    module: {
        loaders: [
            { 
                test: /\.js?$/,
                loader: 'babel',
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
                loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
                include: path.resolve(config.path.src)
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
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin("./css/[name].css", {
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
            "zipFileName": "specWebpack/dist/resource-sameorigin-withoutuglify/offline",
            "src": "specWebpack/dist/resource-sameorigin/",
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