/**
 * Created by Anton on 19.11.2016.
 */
module.exports = function (env) {
  var getJsResult = env.getJsResult;
  var getJsonResult = env.getJsonResult;
  var getCode = env.getCode;
  var assert = env.assert;

  describe('operators', function() {

    describe('arithmetic', function () {
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

      describe('++', function () {
        it('1++', function () {
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
        it('++1', function () {
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
      });
      describe('--', function () {
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
      });
    });
    describe('logical', function () {
      it('1 && 2', function() {
        var code = getCode(function () {
          var a = function () {
            return 1;
          };
          var b = function () {
            return 2;
          };
          a() && b();
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(2, jsResult, jsonResult);
      });
      it('0 && 2', function() {
        var code = getCode(function () {
          var a = function () {
            return 0;
          };
          var b = function () {
            return 2;
          };
          a() && b();
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(0, jsResult, jsonResult);
      });
      it('0 || 1', function() {
        var code = getCode(function () {
          var a = function () {
            return 0;
          };
          var b = function () {
            return 1;
          };
          a() || b();
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(1, jsResult, jsonResult);
      });
      it('1 || 2', function() {
        var code = getCode(function () {
          var a = function () {
            return 1;
          };
          var b = function () {
            return 2;
          };
          a() || b();
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(1, jsResult, jsonResult);
      });
      it('!0', function() {
        var code = getCode(function () {
          !0
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(true, jsResult, jsonResult);
      });
      it('!1', function() {
        var code = getCode(function () {
          !1
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(false, jsResult, jsonResult);
      });
    });
    describe('assignment', function () {
      it('=', function() {
        var code = getCode(function () {
         var a = '1';
         a = '2';
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('2', jsResult, jsonResult);
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
    });
    describe('comparison', function () {
      it('==', function() {
        var code = getCode(function () {
          2 == '2'
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(true, jsResult, jsonResult);
      });
      it('!=', function() {
        var code = getCode(function () {
          2 != 2
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(false, jsResult, jsonResult);
      });
      it('===', function() {
        var code = getCode(function () {
          2 === '2'
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
      it('>', function() {
        var code = getCode(function () {
          2 > 1
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(true, jsResult, jsonResult);
      });
      it('>=', function() {
        var code = getCode(function () {
          2 >= 2
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
      it('<=', function() {
        var code = getCode(function () {
          2 <= 2
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(true, jsResult, jsonResult);
      });
    });
    describe('bitwise', function () {
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
      it('~', function() {
        var code = getCode(function () {
          ~9
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal(-10, jsResult, jsonResult);
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
    });
    describe('cond', function () {
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

    describe('typeof', function() {
      it('typeof 1', function () {
        var code = getCode(function () {
          typeof 1
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('number', jsResult, jsonResult);
      });
      it('typeof "1"', function () {
        var code = getCode(function () {
          typeof "1"
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('string', jsResult, jsonResult);
      });
      it('typeof NaN', function () {
        var code = getCode(function () {
          typeof NaN
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('number', jsResult, jsonResult);
      });
      it('typeof Infinity', function () {
        var code = getCode(function () {
          typeof Infinity
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('number', jsResult, jsonResult);
      });
      it('typeof undefined', function () {
        var code = getCode(function () {
          typeof undefined
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('undefined', jsResult, jsonResult);
      });
      it('typeof null', function () {
        var code = getCode(function () {
          typeof null
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('object', jsResult, jsonResult);
      });
      it('typeof false', function () {
        var code = getCode(function () {
          typeof false
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('boolean', jsResult, jsonResult);
      });
      it('typeof true', function () {
        var code = getCode(function () {
          typeof true
        });
        var jsResult = getJsResult(code);
        var jsonResult = getJsonResult(code);
        assert.equal('boolean', jsResult, jsonResult);
      });
    });

    describe('accessors', function () {
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
    });

    it('void', function() {
      var code = getCode(function () {
        void 0
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(undefined, jsResult, jsonResult);
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
  });
};