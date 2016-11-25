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
    it('forEach', function() {
      var code = getCode(function () {
        var t=[1];
        t.forEach(function(i){t.unshift(2)});
        t.join()
      });
      assert.equal([2,1].join(), getJsResult(code), getJsonResult(code));
    });
    it('trim', function() {
      var code = getCode(function () {
        "".trim();
      });
      assert.equal("", getJsResult(code), getJsonResult(code));
    });
    it('empty key', function() {
      var code = getCode(function () {
        JSON.stringify({'':''})
      });
      assert.equal(JSON.stringify({'':''}), getJsResult(code), getJsonResult(code));
    });
    it('empty array', function() {
      var code = getCode(function () {
        r = 0;
        t=[,,]
        t.forEach(function(a){r++});
        r
      });
      assert.equal(0, getJsResult(code), getJsonResult(code));
    });
    it('empty array', function() {
      var code = getCode(function () {
        r = 0;
        t=[,undefined,]
        t.forEach(function(a){r++});
        r
      });
      assert.equal(1, getJsResult(code), getJsonResult(code));
    });
    it('unary operators', function() {
      var code = getCode(function () {
        var a = +'1234';
        var b = +'ABC';
        a + '-' + b;
      });
      assert.equal('1234-NaN', getJsResult(code), getJsonResult(code));
    });
    it('FunctionDeclaration', function() {
      var code = getCode(function () {
        var a1 = function a2() {};
        [typeof a1, typeof a2].join(',')
      });
      assert.equal('function,undefined', getJsResult(code), getJsonResult(code));
    });
    it('FunctionDeclaration', function() {
      var code = getCode(function () {
        function a2() {};
        typeof a2
      });
      assert.equal('function', getJsResult(code), getJsonResult(code));
    });
    it('FunctionExpression', function() {
      var code = getCode(function () {
        (function a2() {});
        typeof a2
      });
      assert.equal('undefined', getJsResult(code), getJsonResult(code));
    });
    it('FunctionExpression', function() {
      var code = getCode(function () {
        var r = '';
        var t1 = function t2() {
          if (typeof t1 === "function") {
            r = 't1';
          }
          if (typeof t2 === "function") {
            r += 't2';
          }
        };
        t1();
        r;
      });
      assert.equal('t1t2', getJsResult(code), getJsonResult(code));
    });
    it('FunctionDeclaration', function() {
      var code = getCode(function () {
        var r = '';
        var t1 = function t2(t2) {
          if (typeof t1 === 'function') {
            r += '1';
          }
          r += t2;
        };
        t1(1);
        r
      });
      assert.equal('11', getJsResult(code), getJsonResult(code));
    });
    it('FunctionDeclaration', function() {
      var code = getCode(function () {
        function a() {}
      });
      assert.equal(undefined, getJsResult(code), getJsonResult(code));
    });
  });
};