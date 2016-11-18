/**
 * Created by Anton on 17.11.2016.
 */
var Interpreter = require('./interpreter');

var myScript = [
  {
    "type": "var",
    "values": [
      {
        "key": "Fn",
        "value": {
          "type": "function",
          "params": [
            "n"
          ],
          "body": {
            "type": "statement",
            "body": [
              {
                "type": "=",
                "left": {
                  "type": "member",
                  "object": "this",
                  "property": "fn"
                },
                "right": {
                  "type": "function",
                  "params": [
                    "o"
                  ],
                  "body": {
                    "type": "statement",
                    "body": [
                      {
                        "type": "call",
                        "callee": {
                          "type": "member",
                          "object": "console",
                          "property": "log"
                        },
                        "params": [
                          {
                            "type": "raw",
                            "data": "hi!"
                          },
                          "n",
                          "o"
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      },
      {
        "key": "fn",
        "value": {
          "type": "call",
          "isNew": true,
          "callee": "Fn",
          "params": [
            {
              "type": "raw",
              "data": "varA"
            }
          ]
        }
      }
    ]
  },
  {
    "type": "call",
    "callee": {
      "type": "member",
      "object": "console",
      "property": "log"
    },
    "params": [
      {
        "type": "call",
        "callee": {
          "type": "member",
          "object": "fn",
          "property": "fn"
        },
        "params": [
          {
            "type": "raw",
            "data": "varB"
          }
        ]
      }
    ]
  }
];

(function () {
  var interpreter = new Interpreter({
    console: console
  });
  return Promise.resolve().then(function () {
    return interpreter.runScript(myScript);
  }).then(function () {
    console.log('result', arguments);
  }, function (err) {
    console.error(err.stack || err);
  });
})();