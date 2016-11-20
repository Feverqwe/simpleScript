/**
 * Created by Anton on 19.11.2016.
 */
module.exports = function (env) {
  var getJsResult = env.getJsResult;
  var getJsonResult = env.getJsonResult;
  var getCode = env.getCode;
  var assert = env.assert;

  describe('interators', function() {
    it('break 1', function() {
      var code = getCode(function () {
        for(var i=0; i<10; i++) {
          i
          if (i==5) break;
        }
      });
      assert.equal(5, getJsResult(code), getJsonResult(code));
    });
    it('break 2', function() {
      var code = getCode(function () {
        for(var i=0; i<10; i++) {
          for(var j=0; j<15; j++) {
            if (j==5) {
              break;
            }
          }
          if (i==5) {
            break;
          }
        }
        j+i;
      });
      assert.equal(10, getJsResult(code), getJsonResult(code));
    });
    it('continue', function() {
      var code = getCode(function () {
        for(var i=0; i<10; i++) {
          if (i>5) continue;
          i
        }
      });
      assert.equal(5, getJsResult(code), getJsonResult(code));
    });
    it('do while', function() {
      var code = getCode(function () {
        var i = 0;
        do {
          i += 1;
        } while (i < 5)
      });
      assert.equal(5, getJsResult(code), getJsonResult(code));
    });
    it('for', function() {
      var code = getCode(function () {
        var n = 0;
        for (var i = 0; i < 9; i++) {
          n += i
        }
      });
      assert.equal(36, getJsResult(code), getJsonResult(code));
    });
    it('for ;;', function() {
      var code = getCode(function () {
        var i = 1;
        var n = 0;
        for (;;) {
          n += i;
          if (n === 7) {
            break;
          }
        }
      });
      assert.equal(7, getJsResult(code), getJsonResult(code));
    });
    it('forIn', function() {
      var code = getCode(function () {
        var a = {
          p1: 1,
          p2: 2
        };
        for(var p in a) {
          a[p] = a[p] + 1
        }
      });
      assert.equal(3, getJsResult(code), getJsonResult(code));
    });
    it('return', function() {
      var code = getCode(function () {
        function square(x) {
          return x * x;
        }
        square(2);
      });
      assert.equal(4, getJsResult(code), getJsonResult(code));
    });
    it('switch', function() {
      var code = getCode(function () {
        var a = 2+2
        switch (a) {
          case 3:
            'a'
            break
          case 4:
            'b'
            break
          case 5:
            'c'
            break
          default:
            'd'
        }
      });
      assert.equal('b', getJsResult(code), getJsonResult(code));
    });
    it('switch', function() {
      var code = getCode(function () {
        switch (false) {
          case 3:
            'a'
            break
          case 4:
            'b'
            break
          case 5:
            'c'
            break
          default:
            'd'
        }
      });
      assert.equal('d', getJsResult(code), getJsonResult(code));
    });
    it('throw', function() {
      var code = getCode(function () {
        try {
          throw "err"
        } catch(e) {
          e
        }
      });
      assert.equal('err', getJsResult(code), getJsonResult(code));
    });
    it('tryCatch', function() {
      var code = getCode(function () {
        try {
          var i = "something"
          i = toInt(i)
        } catch(e) {
          e.message
        }
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      if (/is not defined/.test(jsResult)) {
        jsResult = true;
      }
      if (/is not a function/.test(jsonResult)) {
        jsonResult = true;
      }
      assert.equal(true, jsResult, jsonResult);
    });
    it('var', function() {
      var code = getCode(function () {
        var a = 0;
        (function () {
          var a = 1;
        })();
        a;
      });
      assert.equal(0, getJsResult(code), getJsonResult(code));
    });
    it('while', function() {
      var code = getCode(function () {
        var n = 0
        var x = 0
        while (n < 3) {
          n ++;
          x += n;
        }
        n + ',' + x
      });
      assert.equal('3,6', getJsResult(code), getJsonResult(code));
    });
    it('while', function() {
      var code = getCode(function () {
        function BreakTest(breakpoint){
          var i = 0;
          while (i < 100) {
            if (i == breakpoint)
              break;
            i++;
          }
          return(i);
        }
        BreakTest(3);
      });
      assert.equal(3, getJsResult(code), getJsonResult(code));
    });

  });
};