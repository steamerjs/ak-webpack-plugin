"use strict";
/**
 * @plugin ak-webpack-plugin
 * @author  heyli
 */

const fs = require('fs-extra'),
	  klawSync = require('klaw-sync'),
	  path = require('path'),
	  archiver = require('archiver'),
	  chalk = require('chalk'),
	  minimatch = require('minimatch');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};

function emptyFunc() {}

String.prototype.replaceJsAll = function(search, replacement, extension) {
	var target = this,
		originSearch = search,
		originWebserver = replacement,
    	cdnUrl = search.replace("//", ""),
    	webserverUrl = replacement.replace("//", "");

	search = search.replace("//", "");
	if (search[search.length - 1] === "/") {
    	search = search.substr(0, search.length - 1);
	}

	if (extension === 'html') {
	    target = target.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
	    	if (!!~match.indexOf(cdnUrl)) {
	    		match = match.replace(cdnUrl, webserverUrl);
	    	}
	    	return match;
	    });
	}
	else if (extension === 'js') {
	    target = target.replace(new RegExp(search + "(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
	    	match = match.replace(cdnUrl, webserverUrl);
	    	return match;
	    });

	    target = target.replace(new RegExp("[\"|']" + originSearch + "[\"|']", 'gi'), function(match) {
	    	match = match.replace(match, "\"" + originWebserver + "\"");

	    	return match;
	    });
	}

    return target;
};

function AkWebpackPlugin(opts) {
	this.config = {};
	this.config.zipFileName = opts.zipFileName || 'offline';
	this.config.src = opts.src || 'src';
	this.config.isSameOrigin = opts.isSameOrigin || false;
	this.config.map = opts.map || [];
	this.config.zipConfig = opts.zipConfig || {};
	this.config.keepOffline = opts.keepOffline || false;
	this.config.beforeCopy = opts.beforeCopy || emptyFunc;
	this.config.afterCopy = opts.afterCopy || emptyFunc;
	this.config.beforeZip = opts.beforeZip || emptyFunc;
	this.config.afterZip = opts.afterZip || emptyFunc;
}

AkWebpackPlugin.prototype.apply = function(compiler) {
	compiler.plugin("done", () => {

		this.addDestUrl();

		this.copyFiles();

		this.excludeFiles();
			
		this.replaceUrl();

		this.zipFiles();

	});
};

AkWebpackPlugin.prototype.success = function(msg) {
	console.log(chalk.green('[ak-webpack-plugin]  ' + msg));
};

AkWebpackPlugin.prototype.info = function(msg) {
	console.log(chalk.cyan('[ak-webpack-plugin]  ' + msg));
};

AkWebpackPlugin.prototype.warn = function(msg) {
	console.log(chalk.yellow('[ak-webpack-plugin]  ' + msg));
};

AkWebpackPlugin.prototype.alert = function(msg) {
	console.log(chalk.red('[ak-webpack-plugin]  ' + msg));
};

/**
 * [add destUrl property to config map data]
 */
AkWebpackPlugin.prototype.addDestUrl = function() {

	let hasWebserver = false,
		webServerConfig = {};

	this.config.map.map((item) => {

		if (item.isWebserver) {
			hasWebserver = true;
			webServerConfig = item;
		}

	});

	this.config.map.map((item) => {

		item.destUrl = item.url;

		if (hasWebserver && item.isSameOrigin) {
			item.destUrl = webServerConfig.url || "";
		}
	});

};

/**
 * [copy files to offline folder]
 */
AkWebpackPlugin.prototype.copyFiles = function() {

	var beforeCopy = this.config.beforeCopy,
		afterCopy = this.config.afterCopy;
	
	beforeCopy();

	let cwd = process.cwd();

	fs.removeSync(path.join(cwd, this.config.zipFileName));
	fs.removeSync(path.join(cwd, this.config.zipFileName + ".zip"));

	this.config.map.forEach((item) => {
		let srcPath = path.join(this.config.src, item.src);

		let url = item.destUrl.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/"),
			dest = item.dest || "";

		let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);
		
		if (fs.existsSync(srcPath)) {
			fs.copySync(srcPath, destPath);
		}
		
	});

	afterCopy();
};

/**
 * [remove exclude folder or files]
 */
AkWebpackPlugin.prototype.excludeFiles = function() {

	let cwd = process.cwd();

	this.config.map.forEach((item) => {

		let url = item.destUrl.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/"),
			dest = item.dest || "";

		let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);

		if (!item.exclude || !item.exclude.length) {
			return;
		}

		if (!fs.existsSync(destPath)) {
			this.alert(destPath + ' does not exist');
			return;
		}

		// include folder itself
		let walkFiles = klawSync(destPath);
		walkFiles.unshift({path: destPath});

		walkFiles.forEach((file) => {
			// loop through exclude files patterns
			item.exclude.forEach((match) => {
				if (minimatch(file.path, match, {
					matchBase: true,
					dot: true
				})) {
					if (fs.existsSync(file.path)) {
						fs.removeSync(file.path);
					}
				}
			});
			
		});
	});
};

/**
 * [replace cdn url with webserver url]
 */
AkWebpackPlugin.prototype.replaceUrl = function() {
	let hasWebserver = false,
		hasCdn = false,
		webserverDestUrl = null,
		webserverUrl = null,
		cdnDestUrl = null,
		cdnUrl = null;

	let _this = this;

	this.config.map.forEach((item) => {
		if (item.isWebserver) {
			hasWebserver = true;
			webserverDestUrl = item.destUrl;
			webserverUrl = item.url;
		}

		if (item.isSameOrigin) {
			hasCdn = true;
			cdnDestUrl = item.destUrl;
			cdnUrl = item.url;
		}
	});

	if (hasWebserver && hasCdn) {

		function walkAndReplace(config, folder, extname) {
			let srcPath = path.join(config.zipFileName, folder);
			srcPath = path.resolve(srcPath.replace(":", "/"));

			if (!fs.existsSync(srcPath)) {
				_this.alert(srcPath + ' does not exist');
				return;
			}

			let files = klawSync(srcPath);
			files = files.filter((item) => {
				return path.extname(item.path) === "." + extname;
			});

			files.map((item) => {
				let content = fs.readFileSync(item.path, "utf-8");
				content = content.replaceJsAll(cdnUrl, webserverUrl, extname);
				fs.writeFileSync(item.path, content, "utf-8");
			});
		}
		
		walkAndReplace(this.config, cdnDestUrl.replaceAll("//", ""), "js");
		walkAndReplace(this.config, webserverDestUrl.replaceAll("//", ""), "html");
	}
};

/**
 * [zip files]
 */
AkWebpackPlugin.prototype.zipFiles = function() {

	var beforeZip = this.config.beforeZip,
		afterZip = this.config.afterZip;

	let srcPath = path.resolve(this.config.zipFileName),
		zipPath = path.resolve(this.config.zipFileName + ".zip");

	if (!fs.existsSync(srcPath)) {
		this.alert(srcPath + ' does not exists');
		return;
	}

	beforeZip();

	var output = fs.createWriteStream(zipPath);
	var archive = archiver('zip', this.config.zipConfig);

	output.on('close', () => {
		this.info('Zip file total size: ' + Math.floor(archive.pointer() / 1024) + 'KB\n');

		// del offline folder
		let offlinePath = path.resolve(this.config.zipFileName);
		if (!this.config.keepOffline && fs.existsSync(offlinePath)) {
			fs.remove(offlinePath);
		}
	});

	// good practice to catch this error explicitly
	archive.on('error', (err) => {
		this.alert('err');
		throw err;
	});


	let zipFile = path.resolve(this.config.zipFileName);

	if (!fs.existsSync(zipFile)) {
		this.alert(zipFile + ' does not exists');
		return;
	}

	let zipFiles = klawSync(zipFile, {nodir: true});

	// archive.directory('offline/');
	
	zipFiles.forEach((item) => {
		archive.file(item.path, { name: path.relative(this.config.zipFileName, item.path) });
	});

	// pipe archive data to the file
	archive.pipe(output);

	archive.finalize();

	afterZip();

};

module.exports = AkWebpackPlugin;