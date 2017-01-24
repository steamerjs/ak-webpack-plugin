"use strict";
/**
 * @plugin ak-webpack-plugin
 * @author  heyli
 */

const fs = require('fs-extra'),
	  klawSync = require('klaw-sync'),
	  path = require('path'),
	  archiver = require('archiver'),
	  colors = require('colors');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};

function AkWebpackPlugin(opts) {
	this.config = {};
	this.config.zipFileName = opts.zipFileName || 'offline';
	this.config.src = opts.src || 'src';
	this.config.isSameOrigin = opts.isSameOrigin || false;
	this.config.map = opts.map || [];
}

AkWebpackPlugin.prototype.apply = function(compiler) {
	compiler.plugin("after-emit", (compilation, callback) => {

		this.warn("=====ak-webapck-plugin=====")

		this.copyFiles();

		if (this.config.isSameOrigin) {
			this.replaceUrl();
		}

		this.zipFiles();

		callback();
	});
};

AkWebpackPlugin.prototype.info = function(msg) {
	console.log(msg.green);
};

AkWebpackPlugin.prototype.warn = function(msg) {
	console.log(msg.yellow);
};

AkWebpackPlugin.prototype.alert = function(msg) {
	console.log(msg.red);
};


/**
 * [copy files to offline folder]
 */
AkWebpackPlugin.prototype.copyFiles = function() {
	let cwd = process.cwd();

	fs.removeSync(path.join(cwd, this.config.zipFileName));
	fs.removeSync(path.join(cwd, this.config.zipFileName + ".zip"));

	this.config.map.forEach((item, key) => {
		let srcPath = path.join(this.config.src, item.src);

		let url = item.url.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/");

		let destPath = path.join(cwd, this.config.zipFileName, url);

		fs.copySync(srcPath, destPath);

		this.info(destPath + " is copied success!");
	});
};

/**
 * [replace cdn url with webserver url]
 */
AkWebpackPlugin.prototype.replaceUrl = function() {
	let hasWebserver = false,
		hasCdn = false,
		webserverUrl = null,
		cdnUrl = null;

	this.config.map.forEach((item, key) => {
		if (item.src === "webserver") {
			hasWebserver = true;
			webserverUrl = item.url;
		}

		if (item.src === "cdn") {
			hasCdn = true;
			cdnUrl = item.url;
		}
	});

	if (hasWebserver && hasCdn) {

		function walkAndReplace(config, folder, extname) {
			let srcPath = path.join(config.zipFileName, folder);
			srcPath = path.resolve(srcPath.replace(":", "/"));

			let files = klawSync(srcPath);

			files = files.filter((item, key) => {
				return path.extname(item.path) === "." + extname;
			});

			files.map((item, key) => {
				let content = fs.readFileSync(item.path, "utf-8");
				content = content.replaceAll(cdnUrl, webserverUrl);
				fs.writeFileSync(item.path, content, "utf-8");
			});
		}
		
		walkAndReplace(this.config, cdnUrl.replaceAll("//", ""), "js");
		walkAndReplace(this.config, webserverUrl.replaceAll("//", ""), "html");
	}
};

/**
 * [zip files]
 */
AkWebpackPlugin.prototype.zipFiles = function() {
	let zipPath = path.resolve(this.config.zipFileName + ".zip");

	var output = fs.createWriteStream(zipPath);
	var archive = archiver('zip', {
	    store: true // Sets the compression method to STORE.
	});

	output.on('close', function() {
	  console.log(archive.pointer() + ' total bytes');
	  console.log('archiver has been finalized and the output file descriptor has closed.');
	});

	// good practice to catch this error explicitly
	archive.on('error', function(err) {
	  throw err;
	});

	archive.directory(this.config.zipFileName);

	// pipe archive data to the file
	archive.pipe(output);

};

module.exports = AkWebpackPlugin;