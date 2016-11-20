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
        assert.equal(3, getJsResult(code), getJsonResult(code));
      });
      it('-', function() {
        var code = getCode(function () {
          1 - 2;
        });
        assert.equal(-1, getJsResult(code), getJsonResult(code));
      });
      it('*', function() {
        var code = getCode(function () {
          3 * 2;
        });
        assert.equal(6, getJsResult(code), getJsonResult(code));
      });
      it('/', function() {
        var code = getCode(function () {
          3 / 2;
        });
        assert.equal(1.5, getJsResult(code), getJsonResult(code));
      });
      it('%', function() {
        var code = getCode(function () {
          7 % 2
        });
        assert.equal(1, getJsResult(code), getJsonResult(code));
      });

      describe('++', function () {
        it('1++', function () {
          var code = getCode(function () {
            (function () {
              var i = 1;
              return i++;
            })();
          });
          assert.equal(1, getJsResult(code), getJsonResult(code));
        });
        it('++1', function () {
          var code = getCode(function () {
            (function () {
              var i = 1;
              return ++i;
            })();
          });
          assert.equal(2, getJsResult(code), getJsonResult(code));
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
          assert.equal(1, getJsResult(code), getJsonResult(code));
        });
        it('--1', function() {
          var code = getCode(function () {
            (function () {
              var i = 1;
              return --i;
            })();
          });
          assert.equal(0, getJsResult(code), getJsonResult(code));
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
        assert.equal(2, getJsResult(code), getJsonResult(code));
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
        assert.equal(0, getJsResult(code), getJsonResult(code));
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
        assert.equal(1, getJsResult(code), getJsonResult(code));
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
        assert.equal(1, getJsResult(code), getJsonResult(code));
      });
      it('!0', function() {
        var code = getCode(function () {
          !0
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('!1', function() {
        var code = getCode(function () {
          !1
        });
        assert.equal(false, getJsResult(code), getJsonResult(code));
      });
    });
    describe('assignment', function () {
      it('=', function() {
        var code = getCode(function () {
         var a = '1';
         a = '2';
        });
        assert.equal('2', getJsResult(code), getJsonResult(code));
      });
      it('+=', function() {
        var code = getCode(function () {
          (function () {
            var i = 1;
            return i += 1
          })();
        });
        assert.equal(2, getJsResult(code), getJsonResult(code));
      });
      it('-=', function() {
        var code = getCode(function () {
          (function () {
            var i = 1;
            return i -= 1
          })();
        });
        assert.equal(0, getJsResult(code), getJsonResult(code));
      });
      it('*=', function() {
        var code = getCode(function () {
          (function () {
            var i = 2;
            return i *= 2
          })();
        });
        assert.equal(4, getJsResult(code), getJsonResult(code));
      });
      it('/=', function() {
        var code = getCode(function () {
          (function () {
            var i = 2;
            return i /= 2
          })();
        });
        assert.equal(1, getJsResult(code), getJsonResult(code));
      });
      it('>>=', function() {
        var code = getCode(function () {
          (function () {
            var i = -9;
            return i >>= 2
          })();
        });
        assert.equal(-3, getJsResult(code), getJsonResult(code));
      });
      it('<<=', function() {
        var code = getCode(function () {
          (function () {
            var i = 9;
            return i <<= 2
          })();
        });
        assert.equal(36, getJsResult(code), getJsonResult(code));
      });
      it('>>>=', function() {
        var code = getCode(function () {
          (function () {
            var i = -9;
            return i >>>= 2
          })();
        });
        assert.equal(1073741821, getJsResult(code), getJsonResult(code));
      });
      it('&=', function() {
        var code = getCode(function () {
          (function () {
            var i = 14;
            return i &= 9
          })();
        });
        assert.equal(8, getJsResult(code), getJsonResult(code));
      });
      it('|=', function() {
        var code = getCode(function () {
          (function () {
            var i = 14;
            return i |= 9
          })();
        });
        assert.equal(15, getJsResult(code), getJsonResult(code));
      });
      it('^=', function() {
        var code = getCode(function () {
          (function () {
            var i = 14;
            return i ^= 9
          })();
        });
        assert.equal(7, getJsResult(code), getJsonResult(code));
      });
      it('%=', function() {
        var code = getCode(function () {
          (function () {
            var i = 7;
            return i %= 2
          })();
        });
        assert.equal(1, getJsResult(code), getJsonResult(code));
      });
    });
    describe('comparison', function () {
      it('==', function() {
        var code = getCode(function () {
          2 == '2'
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('2.5 == "2.5"', function() {
        var code = getCode(function () {
          2.5 == '2.5'
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('!=', function() {
        var code = getCode(function () {
          2 != 2
        });
        assert.equal(false, getJsResult(code), getJsonResult(code));
      });
      it('===', function() {
        var code = getCode(function () {
          2 === '2'
        });
        assert.equal(false, getJsResult(code), getJsonResult(code));
      });
      it('2.5 === 2.5', function() {
        var code = getCode(function () {
          2.5 === 2.5
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('!==', function() {
        var code = getCode(function () {
          2 !== 3
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('>', function() {
        var code = getCode(function () {
          2 > 1
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('>=', function() {
        var code = getCode(function () {
          2 >= 2
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('<', function() {
        var code = getCode(function () {
          2 < 1
        });
        assert.equal(false, getJsResult(code), getJsonResult(code));
      });
      it('<=', function() {
        var code = getCode(function () {
          2 <= 2
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
    });
    describe('bitwise', function () {
      it('&', function() {
        var code = getCode(function () {
          14 & 9
        });
        assert.equal(8, getJsResult(code), getJsonResult(code));
      });
      it('|', function() {
        var code = getCode(function () {
          14 | 9
        });
        assert.equal(15, getJsResult(code), getJsonResult(code));
      });
      it('^', function() {
        var code = getCode(function () {
          14 ^ 9
        });
        assert.equal(7, getJsResult(code), getJsonResult(code));
      });
      it('~', function() {
        var code = getCode(function () {
          ~9
        });
        assert.equal(-10, getJsResult(code), getJsonResult(code));
      });
      it('<<', function() {
        var code = getCode(function () {
          9 << 2
        });
        assert.equal(36, getJsResult(code), getJsonResult(code));
      });
      it('>>', function() {
        var code = getCode(function () {
          -9 >> 2
        });
        assert.equal(-3, getJsResult(code), getJsonResult(code));
      });
      it('>>>', function() {
        var code = getCode(function () {
          -9 >>> 2
        });
        assert.equal(1073741821, getJsResult(code), getJsonResult(code));
      });
    });
    describe('cond', function () {
      it('if inline', function() {
        var code = getCode(function () {
          1?true:false
        });
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
      it('if', function() {
        var code = getCode(function () {
          if (1 - 1) {
            true
          } else {
            false
          }
        });
        assert.equal(false, getJsResult(code), getJsonResult(code));
      });
    });

    describe('typeof', function() {
      it('typeof 1', function () {
        var code = getCode(function () {
          typeof 1
        });
        assert.equal('number', getJsResult(code), getJsonResult(code));
      });
      it('typeof "1"', function () {
        var code = getCode(function () {
          typeof "1"
        });
        assert.equal('string', getJsResult(code), getJsonResult(code));
      });
      it('typeof NaN', function () {
        var code = getCode(function () {
          typeof NaN
        });
        assert.equal('number', getJsResult(code), getJsonResult(code));
      });
      it('typeof Infinity', function () {
        var code = getCode(function () {
          typeof Infinity
        });
        assert.equal('number', getJsResult(code), getJsonResult(code));
      });
      it('typeof undefined', function () {
        var code = getCode(function () {
          typeof undefined
        });
        assert.equal('undefined', getJsResult(code), getJsonResult(code));
      });
      it('typeof null', function () {
        var code = getCode(function () {
          typeof null
        });
        assert.equal('object', getJsResult(code), getJsonResult(code));
      });
      it('typeof false', function () {
        var code = getCode(function () {
          typeof false
        });
        assert.equal('boolean', getJsResult(code), getJsonResult(code));
      });
      it('typeof true', function () {
        var code = getCode(function () {
          typeof true
        });
        assert.equal('boolean', getJsResult(code), getJsonResult(code));
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
        assert.equal(true, getJsResult(code), getJsonResult(code));
      });
    });

    it('void', function() {
      var code = getCode(function () {
        void 0
      });
      assert.equal(undefined, getJsResult(code), getJsonResult(code));
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
      assert.equal(true, getJsResult(code), getJsonResult(code));
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
      assert.equal(5, getJsResult(code), getJsonResult(code));
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
      assert.equal(true, getJsResult(code), getJsonResult(code));
    });
    it('instanceof', function() {
      var code = getCode(function () {
        (function () {
          var str = new String();
          return str instanceof String
        })();
      });
      assert.equal(true, getJsResult(code), getJsonResult(code));
    });
    it('new', function() {
      var code = getCode(function () {
        (function () {
          var error = new Error("Test error");
          return error instanceof Error;
        })();
      });
      assert.equal(true, getJsResult(code), getJsonResult(code));
    });
  });
};