/**
 * Created by Anton on 19.11.2016.
 */
var assert = require('assert');
var Interpreter = require('../interpreter');
var ScriptToJson = require('../scriptToJson');

var scriptToJson = new ScriptToJson();

var getCode = function (code) {
  code = code.toString();
  code = code.substr(code.indexOf('{') + 1);
  code = code.substr(0, code.lastIndexOf('}'));
  return code;
};

var getJsResult = function (code) {
  return eval(code);
};

var getJsonResult = function (code) {
  var interpreter = new Interpreter({
    console: console,
    String: String,
    Error: Error,
    JSON: JSON,
    RegExp: RegExp
  });
  return interpreter.runScript(scriptToJson.getJson(code));
};

assert.equal = (function (cb) {
  return function () {
    console.log('equal data:', arguments[0], arguments[1], arguments[2], '\n');
    if (arguments[0] !== arguments[1] && arguments[1] === arguments[2]) {
      arguments[1] = arguments[0];
    }
    cb.call(null, arguments[1], arguments[2])
  };
})(assert.equal.bind(assert));

var env = {
  getJsResult: getJsResult,
  getJsonResult: getJsonResult,
  getCode: getCode,
  assert: assert
};

require('./other')(env);
require('./iterators')(env);
require('./operators')(env);