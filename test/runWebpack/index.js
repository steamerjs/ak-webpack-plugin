"use strict";

const fs = require('fs-extra'),
	  async = require("async"),
	  webpack = require('webpack'),
	  path = require('path');
	
// fs.removeSync('./dist');

var basePath = path.resolve('./test/runWebpack/src/');

var webpackConfig = [
	require(basePath + '/resource-build/webpack.config.js'),
	require(basePath + '/resource-build1/webpack.config.js'),
	require(basePath + '/resource-sameorigin/webpack.config.js'),
	require(basePath + '/resource-sameorigin-withoutuglify/webpack.config.js'),
];

fs.removeSync(path.join(process.cwd(), 'test/runWebpack/dist/'));

async.filter(webpackConfig, function(configPath, callback) {

	let compiler = webpack(configPath);
	compiler.run(function(err, stats) {
	    callback(err, stats);
	});
	
}, function(err, results) {
    if (err) {
    	console.log(err);
    }
});

