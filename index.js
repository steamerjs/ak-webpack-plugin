"use strict";
/**
 * @plugin ak-webpack-plugin
 * @author  heyli
 */

const fs = require('fs-extra'),
	  klawSync = require('klaw-sync'),
	  path = require('path'),
	  archiver = require('archiver'),
	  colors = require('colors'),
	  minimatch = require('minimatch');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};

String.prototype.replaceJsAll = function(search, replacement) {
    var target = this,
    	cdnUrl = search.replace("//", ""),
    	webserverUrl = replacement.replace("//", "");

    search = search.replace("//", "");
    if (search[search.length - 1] === "/") {
    	search = search.substr(0, search.length - 1);
    	search += "\\\/";
    }

    return target.replace(new RegExp("(.\\\s*)" + search + "(.*)(.js)", 'gi'), function(match) {
    	match = match.replace(cdnUrl, webserverUrl);
    	return match;
    });
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

		this.warn("ak-webapck-plugin:\n");

		this.addDestUrl();

		this.copyFiles();

		this.excludeFiles();
			
		this.replaceUrl();

		this.zipFiles();

		callback();
	});
};

AkWebpackPlugin.prototype.success = function(msg) {
	console.log(msg.green);
};

AkWebpackPlugin.prototype.info = function(msg) {
	console.log(msg.cyan);
};

AkWebpackPlugin.prototype.warn = function(msg) {
	console.log(msg.yellow);
};

AkWebpackPlugin.prototype.alert = function(msg) {
	console.log(msg.red);
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

	let cwd = process.cwd();

	fs.removeSync(path.join(cwd, this.config.zipFileName));
	fs.removeSync(path.join(cwd, this.config.zipFileName + ".zip"));

	this.config.map.forEach((item) => {
		let srcPath = path.join(this.config.src, item.src);

		let url = item.destUrl.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/"),
			dest = item.dest || "";

		let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);


		fs.copySync(srcPath, destPath);

		// this.info(destPath + " is copied success!");
	});
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

			let files = klawSync(srcPath);

			files = files.filter((item) => {
				return path.extname(item.path) === "." + extname;
			});

			files.map((item) => {
				let content = fs.readFileSync(item.path, "utf-8");
				content = content.replaceJsAll(cdnUrl, webserverUrl);
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
	let zipPath = path.resolve(this.config.zipFileName + ".zip");

	var output = fs.createWriteStream(zipPath);
	var archive = archiver('zip', {
	    store: true // Sets the compression method to STORE.
	});

	output.on('close', () => {
		this.info('Zip file total size: ' + Math.floor(archive.pointer() / 1024) + 'KB\n');
	});

	// good practice to catch this error explicitly
	archive.on('error', (err) => {
		this.error('error');
		throw err;
	});

	let zipFiles = klawSync(path.resolve(this.config.zipFileName), {nodir: true});

	// archive.directory('offline/');
	
	zipFiles.forEach((item) => {
		archive.file(item.path, { name: path.relative(this.config.zipFileName, item.path) });
	});

	// pipe archive data to the file
	archive.pipe(output);

	archive.finalize();

};

module.exports = AkWebpackPlugin;