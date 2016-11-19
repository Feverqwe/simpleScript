/**
 * Created by Anton on 19.11.2016.
 */
module.exports = function (env) {
  var getJsResult = env.getJsResult;
  var getJsonResult = env.getJsonResult;
  var getCode = env.getCode;
  var assert = env.assert;

  describe('operators', function() {
    it('+', function() {
      var code = getCode(function () {
        1 + 2;
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(3, jsResult, jsonResult);
    });
    it('-', function() {
      var code = getCode(function () {
        1 - 2;
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(-1, jsResult, jsonResult);
    });
    it('*', function() {
      var code = getCode(function () {
        3 * 2;
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(6, jsResult, jsonResult);
    });
    it('/', function() {
      var code = getCode(function () {
        3 / 2;
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1.5, jsResult, jsonResult);
    });
    it('%', function() {
      var code = getCode(function () {
        7 % 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1, jsResult, jsonResult);
    });
    it('>', function() {
      var code = getCode(function () {
        2 > 1
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('<', function() {
      var code = getCode(function () {
        2 < 1
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(false, jsResult, jsonResult);
    });
    it('>=', function() {
      var code = getCode(function () {
        2 >= 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('<=', function() {
      var code = getCode(function () {
        2 <= 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('==', function() {
      var code = getCode(function () {
        2 == '2'
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('===', function() {
      var code = getCode(function () {
        2 === '2'
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(false, jsResult, jsonResult);
    });
    it('!=', function() {
      var code = getCode(function () {
        2 != 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(false, jsResult, jsonResult);
    });
    it('!==', function() {
      var code = getCode(function () {
        2 !== 3
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('&', function() {
      var code = getCode(function () {
        14 & 9
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(8, jsResult, jsonResult);
    });
    it('|', function() {
      var code = getCode(function () {
        14 | 9
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(15, jsResult, jsonResult);
    });
    it('^', function() {
      var code = getCode(function () {
        14 ^ 9
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(7, jsResult, jsonResult);
    });
    it('<<', function() {
      var code = getCode(function () {
        9 << 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(36, jsResult, jsonResult);
    });
    it('>>', function() {
      var code = getCode(function () {
        -9 >> 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(-3, jsResult, jsonResult);
    });
    it('>>>', function() {
      var code = getCode(function () {
        -9 >>> 2
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1073741821, jsResult, jsonResult);
    });

    it('typeof', function() {
      var code = getCode(function () {
        typeof 1
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal('number', jsResult, jsonResult);
    });
    it('void', function() {
      var code = getCode(function () {
        void 0
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(undefined, jsResult, jsonResult);
    });
    it('!', function() {
      var code = getCode(function () {
        !0
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('~', function() {
      var code = getCode(function () {
        ~9
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(-10, jsResult, jsonResult);
    });

    it('+=', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return i += 1
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(2, jsResult, jsonResult);
    });
    it('-=', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return i -= 1
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(0, jsResult, jsonResult);
    });
    it('*=', function() {
      var code = getCode(function () {
        (function () {
          var i = 2;
          return i *= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(4, jsResult, jsonResult);
    });
    it('/=', function() {
      var code = getCode(function () {
        (function () {
          var i = 2;
          return i /= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1, jsResult, jsonResult);
    });
    it('%=', function() {
      var code = getCode(function () {
        (function () {
          var i = 7;
          return i %= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1, jsResult, jsonResult);
    });
    it('<<=', function() {
      var code = getCode(function () {
        (function () {
          var i = 9;
          return i <<= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(36, jsResult, jsonResult);
    });
    it('>>=', function() {
      var code = getCode(function () {
        (function () {
          var i = -9;
          return i >>= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(-3, jsResult, jsonResult);
    });
    it('>>>=', function() {
      var code = getCode(function () {
        (function () {
          var i = -9;
          return i >>>= 2
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1073741821, jsResult, jsonResult);
    });
    it('&=', function() {
      var code = getCode(function () {
        (function () {
          var i = 14;
          return i &= 9
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(8, jsResult, jsonResult);
    });
    it('^=', function() {
      var code = getCode(function () {
        (function () {
          var i = 14;
          return i ^= 9
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(7, jsResult, jsonResult);
    });
    it('|=', function() {
      var code = getCode(function () {
        (function () {
          var i = 14;
          return i |= 9
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(15, jsResult, jsonResult);
    });

    it('1++', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return i++;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1, jsResult, jsonResult);
    });
    it('++1', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return ++i;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(2, jsResult, jsonResult);
    });
    it('1--', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return i--;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(1, jsResult, jsonResult);
    });
    it('--1', function() {
      var code = getCode(function () {
        (function () {
          var i = 1;
          return --i;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(0, jsResult, jsonResult);
    });

    it('delete', function() {
      var code = getCode(function () {
        (function () {
          var t = {a: 1};
          if (t.hasOwnProperty('a')) {
            delete t.a;
          }
          return !t.hasOwnProperty('a');
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('function', function() {
      var code = getCode(function () {
        (function () {
          var fn = function () {
            return 5;
          };
          return fn();
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(5, jsResult, jsonResult);
    });
    it('in', function() {
      var code = getCode(function () {
        (function () {
          var obj = {a: 5};
          if ("a" in obj) {
            return "toString" in obj;
          }
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('instanceof', function() {
      var code = getCode(function () {
        (function () {
          var str = new String();
          return str instanceof String
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('new', function() {
      var code = getCode(function () {
        (function () {
          var error = new Error("Test error");
          return error instanceof Error;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('property', function() {
      var code = getCode(function () {
        (function () {
          var obj = {a:{b:{c:true}}};
          return obj.a.b.c;
        })();
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('if inline', function() {
      var code = getCode(function () {
        1?true:false
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(true, jsResult, jsonResult);
    });
    it('if', function() {
      var code = getCode(function () {
        if (1 - 1) {
          true
        } else {
          false
        }
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(false, jsResult, jsonResult);
    });
  });
};