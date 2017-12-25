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
        'libs/react': [path.join(config.path.src, "/resource-build1/libs/react")],
        'index': [path.join(config.path.src, "/resource-build1/index")],
    },
    output: {
        publicPath: config.cdn,
        path: path.join(config.path.dist + '/resource-build1/cdn/'),
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
        new ExtractTextPlugin({
            filename: "./css/[name].css",
            publicPath: "//localhost:1111/",
        }),
        new HtmlResWebpackPlugin({
            mode: 'html',
        	filename: "../webserver/entry.html",
	        template: config.path.src + "/resource-build1/index.html",
            cssPublicPath: "//localhost:1111/",
	        htmlMinify: null
        }),
        new AkWebpackPlugin({
            "zipFileName": "test/runWebpack/dist/resource-build1/ak",
            "src": "test/runWebpack/dist/resource-build1/",
            "zipConfig": {
                zlib: { level: 9 },
            }, 
            "map": [
                {
                    "src": "webserver",
                    "url": config.defaultPath
                },
                {
                    "src": "cdn",
                    "url": config.cdn,
                    "exclude": ['*.png', '*ell.jpg'],
                }
            ]
        })
    ],
    watch: false,
};

// console.log(webpackConfig);

module.exports = webpackConfig;