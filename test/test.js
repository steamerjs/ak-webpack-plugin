"use strict";

const path = require('path'),
      expect = require('expect.js'),
      fs = require('fs-extra'),
      decompress = require('decompress');

const RUN_WEBPACK_DIST = path.join(process.cwd(), "test/runWebpack/dist");

describe("resource-build", function() {
  	it("=> check offline folder", function(done) {

  		expect(fs.existsSync(path.join(RUN_WEBPACK_DIST, '/resource-build/ak.zip'))).to.be(true);
  		
  		var offline = path.join(RUN_WEBPACK_DIST, '/resource-build/ak'),
  			localhost = fs.readdirSync(offline);

    	expect(localhost[0]).to.be('localhost');

    	var localhost = path.join(RUN_WEBPACK_DIST, '/resource-build/ak/localhost'),
    		ports = fs.readdirSync(localhost);
    	
    	expect(ports[0]).to.be('8000');
    	expect(ports[1]).to.be('9000');

    	var port9000 = path.join(RUN_WEBPACK_DIST, '/resource-build/ak/localhost/9000'),
    		htmlFolder = fs.readdirSync(port9000);

    	expect(htmlFolder[0]).to.be('entry.html');

    	var port8000 = path.join(RUN_WEBPACK_DIST, '/resource-build/ak/localhost/8000'),
    		jsFolder = fs.readdirSync(path.join(port8000, 'js')),
    		cssFolder = fs.readdirSync(path.join(port8000, 'css'));

    	expect(jsFolder[0]).to.be('index.js');
    	expect(jsFolder[1]).to.be('libs');
    	expect(cssFolder[0]).to.be('index.css');

    	var libs = path.join(RUN_WEBPACK_DIST, '/resource-build/ak/localhost/8000/js/libs/'),
    	    libsFolder = fs.readdirSync(libs);

    	expect(libsFolder[0]).to.be('react.js');

        decompress(path.join(RUN_WEBPACK_DIST, '/resource-build/ak.zip'), path.join(RUN_WEBPACK_DIST, '/resource-build/unzip')).then(files => {

            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });

            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/index.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/libs/react.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build/img/adidas.jpg')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build/img/google.jpg')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build/img/ibm.jpg')).to.be(true);
            
            done();
        });
  	});
});

describe("resource-build1", function() {
    it("=> check offline folder", function(done) {
        let dest = path.join(RUN_WEBPACK_DIST, '/resource-build1/'),
            destInfo = fs.readdirSync(dest);

        expect(destInfo.indexOf('ak') === -1).to.be(true);

        expect(fs.existsSync(path.join(RUN_WEBPACK_DIST, '/resource-build1/ak.zip'))).to.be(true);

        decompress(path.join(RUN_WEBPACK_DIST, '/resource-build1/ak.zip'), path.join(RUN_WEBPACK_DIST, '/resource-build1/unzip')).then(files => {

            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });

            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/index.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/libs/react.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build1/img/adidas.jpg')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build1/img/google.jpg')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/resource-build1/img/ibm.jpg')).to.be(true);
            
            done();
        });
    });
});

describe("resource-sameorigin", function() {
    it("=> check offline folder with same origin js files", function(cb) {

        expect(fs.existsSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline.zip'))).to.be(true);
      
        var offline = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline'),
            localhost = fs.readdirSync(offline);

        expect(localhost[0]).to.be('localhost');

        var localhost = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost'),
            ports = fs.readdirSync(localhost);
      
        expect(ports[0]).to.be('8000');
        expect(ports[1]).to.be('9000');

        var port9000 = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/9000'),
            htmlFolder = fs.readdirSync(port9000),
            jsFolder = fs.readdirSync(path.join(port9000, 'js'));

        expect(htmlFolder[0]).to.be('entry.html');
        expect(jsFolder[0]).to.be('index.js');
        expect(jsFolder[1]).to.be('libs');

        var port8000 = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/8000'),
            cssFolder = fs.readdirSync(path.join(port8000, 'css'));

        expect(cssFolder[0]).to.be('index.css');

        var libs = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/9000/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        let htmlContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/9000/entry.html'), "utf-8");

        let matchCount = 0;
        //
        htmlContent.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
            if (!!~match.indexOf('localhost:9000')) {
                matchCount++;
            }
        });

        expect(matchCount).to.be(2);


        let jsContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/9000/js/index.js'), "utf-8");
        matchCount = 0;

        jsContent.replace(new RegExp("localhost:9000(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
            if (!!~match.indexOf('localhost:9000')) {
                matchCount++;
            }
        });

        jsContent.replace(new RegExp("[\"|']\/\/localhost:9000\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(2);

        matchCount = 0;
        jsContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline/localhost/9000/js/libs/react.js'), "utf-8");

        jsContent.replace(new RegExp("[\"|']\/\/localhost:9000\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(1);

        decompress(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/offline.zip'), path.join(RUN_WEBPACK_DIST, '/resource-sameorigin/unzip')).then(files => {
            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });
            
            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/index.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/libs/react.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img')).to.be(false);
            cb();
        });


    });

    it("=> check offline folder with same origin js files without uglify", function(cb) {

        expect(fs.existsSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline.zip'))).to.be(true);
      
        var offline = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline'),
            localhost = fs.readdirSync(offline);

        expect(localhost[0]).to.be('localhost');

        var localhost = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost'),
            ports = fs.readdirSync(localhost);
      
        expect(ports[0]).to.be('8000');
        expect(ports[1]).to.be('9000');

        var port9000 = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/9000'),
            htmlFolder = fs.readdirSync(port9000),
            jsFolder = fs.readdirSync(path.join(port9000, 'js'));

        expect(htmlFolder[0]).to.be('entry.html');
        expect(jsFolder[0]).to.be('detail.js');
        expect(jsFolder[1]).to.be('index.js');
        expect(jsFolder[2]).to.be('libs');

        var port8000 = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/8000'),
            cssFolder = fs.readdirSync(path.join(port8000, 'css'));

        expect(cssFolder[0]).to.be('index.css');

        var libs = path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/9000/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        let htmlContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/9000/entry.html'), "utf-8");

        let matchCount = 0;
        //
        htmlContent.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
            if (!!~match.indexOf('localhost:9000')) {
                matchCount++;
            }
        });

        expect(matchCount).to.be(2);


        let jsContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/9000/js/index.js'), "utf-8");
        matchCount = 0;

        jsContent.replace(new RegExp("localhost:9000(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
            if (!!~match.indexOf('localhost:9000')) {
                matchCount++;
            }
        });

        jsContent.replace(new RegExp("[\"|']\/\/localhost:9000\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(2);

        matchCount = 0;
        jsContent = fs.readFileSync(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline/localhost/9000/js/libs/react.js'), "utf-8");

        jsContent.replace(new RegExp("[\"|']\/\/localhost:9000\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(1);

        decompress(path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/offline.zip'), path.join(RUN_WEBPACK_DIST, '/resource-sameorigin-withoutuglify/unzip')).then(files => {
            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });
            
            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/index.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/libs/react.js')).to.be(true);
            expect(!!~filesArr.indexOf('localhost/8000/img')).to.be(false);
            cb();
        });


    });
});