const path = require('path');

var webpack = require('webpack'),
	config = require('../../config/config'),
	nodeModulesPath = path.resolve('../node_modules');

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
	ExtractTextPlugin = require("extract-text-webpack-plugin-steamer"),
    AkWebpackPlugin = require('ak-webpack-plugin');

var webpackConfig = {
	entry: {
        'libs/react': [path.join(config.path.src, "/resource-build/libs/react")],
        'index': [path.join(config.path.src, "/resource-build/index")],
    },
    output: {
        publicPath: config.cdn,
        path: path.join(config.path.dist + '/resource-build/cdn/'),
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
                test: /\.html$/,
                loader: 'html-loader'
            },
        ],
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin("./css/[name].css", {
            publicPath: "//localhost:1111/",
        }),
        new HtmlResWebpackPlugin({
            mode: 'html',
        	filename: "../webserver/entry.html",
	        template: config.path.src + "/resource-build/index.html",
            cssPublicPath: "//localhost:1111/",
	        htmlMinify: null
        }),
        new AkWebpackPlugin({
            "zipFileName": "specWebpack/dist/resource-build/offline",
            "src": "specWebpack/dist/resource-build/",
            "isSameOrigin": true,
            "map": [
                {
                    "src": "webserver",
                    "url": config.defaultPath,
                },
                {
                    "src": "cdn",
                    "url": config.cdn
                }
            ]
        })
    ],
    watch: false,
};

// console.log(webpackConfig);

module.exports = webpackConfig;