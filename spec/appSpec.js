"use strict";

const path = require('path'),
	  fs = require('fs');


describe("resource-build", function() {
  	it("=> check offline folder", function() {

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
  	});
});