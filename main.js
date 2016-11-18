/**
 * Created by Anton on 17.11.2016.
 */
var Interpreter = require('./interpreter');
var ScriptToJson = require('./scriptToJson');
var uglifyJs = require("uglify-js");

var myScript = function () {
  var Fn = function (a,b) {
    this.fn = function (c) {
      return [a,b,c];
    }
  };
  var fn = new Fn('a', 'b');
  console.log(fn.fn('c'));
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
  var result;
  try {
    result = (new Function([], jsScript))();
  } catch (e) {
    console.error('jsScript', e.stack || e);
  }
  console.timeEnd('jsScript');
  console.log('jsScript result', result);

  var jsonScript = scriptToJson.getJson(jsScript);

  console.time('jsonScript');
  try {
    result = interpreter.runScript(jsonScript);
  } catch (e) {
    console.error('jsonScript', e.stack || e);
  }
  console.timeEnd('jsonScript');
  console.log('jsonScript result', result);
})();