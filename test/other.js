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
    it('scope', function() {
      var code = getCode(function () {
        var a = 1;
        var f = function () {
          a = 2;
        };
        f();
        a
      });
      assert.equal(2, getJsResult(code), getJsonResult(code));
    });
    it('regexp', function() {
      var code = getCode(function () {
        var re = new RegExp(/test/);
        re.test('te1st');
      });
      assert.equal(false, getJsResult(code), getJsonResult(code));
    });
    it('regexp', function() {
      var code = getCode(function () {
        var re = new RegExp(/test/);
        re.test('test');
      });
      assert.equal(true, getJsResult(code), getJsonResult(code));
    });
    it('return', function() {
      var code = getCode(function () {
        var a = (function () {
          return 1;
        })(), b = (function () {
          return 1;
        })(), c = b;
        [a,b,c].join(',')
      });
      assert.equal([1,1,1].join(','), getJsResult(code), getJsonResult(code));
    });
  });
};