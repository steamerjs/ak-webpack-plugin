"use strict";

const path = require('path'),
	  fs = require('fs'),
      decompress = require('decompress');


describe("resource-build", function() {
  	it("=> check offline folder", function(cb) {

  		expect(fs.existsSync('specWebpack/dist/resource-build/offline.zip')).toBe(true);
  		
  		var offline = path.resolve('specWebpack/dist/resource-build/offline'),
  			localhost = fs.readdirSync(offline);

    	expect(localhost[0]).toBe('localhost');

    	var localhost = path.resolve('specWebpack/dist/resource-build/offline/localhost'),
    		ports = fs.readdirSync(localhost);
    	
    	expect(ports[0]).toBe('8000');
    	expect(ports[1]).toBe('9000');

    	var port9000 = path.resolve('specWebpack/dist/resource-build/offline/localhost/9000'),
    		htmlFolder = fs.readdirSync(port9000);

    	expect(htmlFolder[0]).toBe('entry.html');

    	var port8000 = path.resolve('specWebpack/dist/resource-build/offline/localhost/8000'),
    		jsFolder = fs.readdirSync(path.join(port8000, 'js')),
    		cssFolder = fs.readdirSync(path.join(port8000, 'css'));

    	expect(jsFolder[0]).toBe('index.js');
    	expect(jsFolder[1]).toBe('libs');
    	expect(cssFolder[0]).toBe('index.css');

    	var libs = path.resolve('specWebpack/dist/resource-build/offline/localhost/8000/js/libs/'),
    	    libsFolder = fs.readdirSync(libs);

    	expect(libsFolder[0]).toBe('react.js');

        decompress(path.resolve('specWebpack/dist/resource-build/offline.zip'), path.resolve('specWebpack/dist/resource-build/unzip')).then(files => {
            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });
            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/index.js')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/js/libs/react.js')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/specWebpack/src/resource-build/img/adidas.jpg')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/specWebpack/src/resource-build/img/google.jpg')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/img/specWebpack/src/resource-build/img/ibm.jpg')).toBe(true);
            cb();
        });
  	});
});

describe("resource-sameorigin", function() {
    it("=> check offline folder with same origin js files", function(cb) {

        expect(fs.existsSync('specWebpack/dist/resource-sameorigin/offline.zip')).toBe(true);
      
        var offline = path.resolve('specWebpack/dist/resource-sameorigin/offline'),
            localhost = fs.readdirSync(offline);

        expect(localhost[0]).toBe('localhost');

        var localhost = path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost'),
            ports = fs.readdirSync(localhost);
      
        expect(ports[0]).toBe('8000');
        expect(ports[1]).toBe('9000');

        var port9000 = path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost/9000'),
            htmlFolder = fs.readdirSync(port9000),
            jsFolder = fs.readdirSync(path.join(port9000, 'js'));

        expect(htmlFolder[0]).toBe('entry.html');
        expect(jsFolder[0]).toBe('index.js');
        expect(jsFolder[1]).toBe('libs');

        var port8000 = path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost/8000'),
            cssFolder = fs.readdirSync(path.join(port8000, 'css'));

        expect(cssFolder[0]).toBe('index.css');

        var libs = path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost/9000/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).toBe('react.js');

        let htmlContent = fs.readFileSync(path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost/9000/entry.html'), "utf-8");

        let matchCount = 0;
        htmlContent.replace(new RegExp("(.\\\s*)localhost:9000\/(.*)(.js)", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).toBe(2);


        let jsContent = fs.readFileSync(path.resolve('specWebpack/dist/resource-sameorigin/offline/localhost/9000/js/index.js'), "utf-8");
        matchCount = 0;

        jsContent.replace(new RegExp("(.\\\s*)localhost:9000\/(.*)(.js)", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).toBe(1);

        decompress(path.resolve('specWebpack/dist/resource-sameorigin/offline.zip'), path.resolve('specWebpack/dist/resource-sameorigin/unzip')).then(files => {
            let filesArr = [];

            files.map((item) => {
                filesArr.push(item.path);
            });
            
            expect(!!~filesArr.indexOf('localhost/8000/css/index.css')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/9000/entry.html')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/index.js')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/9000/js/libs/react.js')).toBe(true);
            expect(!!~filesArr.indexOf('localhost/8000/img')).toBe(false);
            cb();
        });


    });
});