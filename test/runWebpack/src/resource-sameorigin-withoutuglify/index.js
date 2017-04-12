
require('./index.css');

require('./img/adidas.jpg');
require('./img/dell.jpg');
require('./img/google.jpg');
require('./img/ibm.jpg');
require('./img/intel.png');

require.ensure(["./test"], function() {
  var a = require("./test");
 
});

var a = "hello world!";

var b = "//localhost:8000/js/a.js";

var c = a + b;

console.log(c);