"use strict";

const fs = require('fs-extra'),
	  async = require("async"),
	  webpack = require('webpack'),
	  path = require('path');
	
// fs.removeSync('./dist');

var basePath = path.resolve('./specWebpack/src/');

var webpackConfig = [
	require(basePath + '/resource-build/webpack.config.js'),
];

fs.removeSync(path.resolve('./specWebpack/dist/'));

async.filter(webpackConfig, function(configPath, callback) {

	let compiler = webpack(configPath);
	compiler.run(function(err, stats) {
	    callback(err, stats);
	});
	
}, function(err, results){
    if (!err) {
    	// console.log(results);
    }
    else {
    	console.log(err);
    }
});

