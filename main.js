/**
 * Created by Anton on 17.11.2016.
 */
var Interpreter = require('./interpreter');
var ScriptToJson = require('./scriptToJson');
var uglifyJs = require("uglify-js");

var myScript = function () {
  1;
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
    console: console,
    Date: Date,
    Object: Object,
    Array: Array,
    Math: Math,
    RegExp: RegExp,
    parseInt: parseInt
  });

  var scriptToJson = new ScriptToJson();

  var jsScript = stripFn(myScript);
  console.log('jsScript', jsScript);

  console.time('jsScript');
  var result;
  try {
    result = eval(jsScript);
  } catch (e) {
    console.error('jsScript', e.stack || e);
  }
  console.timeEnd('jsScript');
  console.log('jsScript result', result);

  var jsonScript = scriptToJson.getJson(jsScript);
  console.log('jsonScript', JSON.stringify(jsonScript));

  console.time('jsonScript');
  try {
    result = interpreter.runScript(jsonScript);
  } catch (e) {
    console.error('jsonScript', e.stack || e);
  }
  console.timeEnd('jsonScript');
  console.log('jsonScript result', result);
})();