/**
 * Created by Anton on 17.11.2016.
 */
var Interpreter = require('./interpreter');
var ScriptToJson = require('./scriptToJson');
var uglifyJs = require("uglify-js");

var myScript = function () {
  console.log('hello!');
};

var stripFn = function (code) {
  code = code.toString();
  code = code.substr(code.indexOf('{') + 1);
  code = code.substr(0, code.lastIndexOf('}'));
  code = uglifyJs.minify(code, {fromString: true}).code;

  return code;
};

(function () {
  var interpreter = new Interpreter({
    console: console
  });

  var scriptToJson = new ScriptToJson();

  var jsScript = stripFn(myScript);

  console.time('jsScript');
  (new Function([], jsScript))();
  console.timeEnd('jsScript');

  var jsonScript = scriptToJson.getJson(jsScript);

  console.time('jsonScript');
  interpreter.runScript(jsonScript);
  console.timeEnd('jsonScript');
})();