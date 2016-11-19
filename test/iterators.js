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
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(5, jsResult, jsonResult);
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
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(10, jsResult, jsonResult);
    });
    it('continue', function() {
      var code = getCode(function () {
        for(var i=0; i<10; i++) {
          if (i>5) continue;
          i
        }
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(5, jsResult, jsonResult);
    });
    it('do while', function() {
      var code = getCode(function () {
        var i = 0;
        do {
          i += 1;
        } while (i < 5)
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(5, jsResult, jsonResult);
    });
    it('for', function() {
      var code = getCode(function () {
        var n = 0;
        for (var i = 0; i < 9; i++) {
          n += i
        }
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(36, jsResult, jsonResult);
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
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(7, jsResult, jsonResult);
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
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(3, jsResult, jsonResult);
    });
    it('return', function() {
      var code = getCode(function () {
        function square(x) {
          return x * x;
        }
        square(2);
      });
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal(4, jsResult, jsonResult);
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
      var jsResult = getJsResult(code);
      var jsonResult = getJsonResult(code);
      assert.equal('b', jsResult, jsonResult);
    });
    it('switch', function() {
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

  });
};