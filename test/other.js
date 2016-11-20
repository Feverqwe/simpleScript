/**
 * Created by Anton on 20.11.2016.
 */
module.exports = function (env) {
  var getJsResult = env.getJsResult;
  var getJsonResult = env.getJsonResult;
  var getCode = env.getCode;
  var assert = env.assert;

  describe('other', function() {
    it('computed 1', function() {
      var code = getCode(function () {
        var t = {a:1,'b':2, 'c': {a:1}};
        t.c[(function () {
          return 'a'
        })]
      });
      assert.equal(undefined, getJsResult(code), getJsonResult(code));
    });
    it('computed 2', function() {
      var code = getCode(function () {
        var t = {a:1,'b':2, 'c': {a:1}};
        t.c[(function () {
          return 'a'
        })()]
      });
      assert.equal(1, getJsResult(code), getJsonResult(code));
    });
    it('computed 3', function() {
      var code = getCode(function () {
        var t = {a:1,'b':2,'c': {a:1}};
        JSON.stringify(t)
      });
      assert.equal('{"a":1,"b":2,"c":{"a":1}}', getJsResult(code), getJsonResult(code));
    });
    it('array', function() {
      var code = getCode(function () {
        var a = null;
        var t = [1,a,'a',(function () {
          return 1;
        })()];
        JSON.stringify(t)
      });
      assert.equal('[1,null,"a",1]', getJsResult(code), getJsonResult(code));
    });
  });
};