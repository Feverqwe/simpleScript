/**
 * Created by Anton on 16.11.2016.
 */
var acorn = require('acorn');
var Interpreter = require('./interpreter');
var UglifyJS = require("uglify-js");

var getAst = function () {
  var code = function () {
    /test/.test(test)
  };
  code = code.toString();
  code = code.substr(code.indexOf('{') + 1);
  code = code.substr(0, code.lastIndexOf('}'));
  code = UglifyJS.minify(code, {fromString: true}).code;

  console.log('Code', code);

  return acorn.parse(code);
};

var paramsToArray = function (params) {
  return params.map(function (item) {
    return item.name;
  });
};

var types = {
  VariableDeclaration: function (item) {
    return {
      type: item.kind,
      values: item.declarations.map(function (item) {
        if (item.type !== 'VariableDeclarator') {
          throw new Error('Unsupported type!');
        }

        var key = parseSection(item.id);
        var value;
        if (item.init) {
          value = parseSection(item.init);
        }
        return {key: key, value: value};
      })
    };
  },
  Identifier: function (item) {
    if (item.name === 'undefined') {
      return;
    } else {
      return item.name;
    }
  },
  FunctionExpression: function (item) {
    return {
      type: 'function',
      params: paramsToArray(item.params),
      body: parseSection(item.body)
    };
  },
  FunctionDeclaration: function (item) {
    var value = {
      type: 'function',
      params: paramsToArray(item.params),
      body: parseSection(item.body)
    };

    if (item.id.name) {
      value = {
        type: 'var',
        name: item.id.name,
        value: value
      };
    }

    return value;
  },
  ForStatement: function (item) {
    var obj = {
      type: 'for',
      body: parseSection(item.body)
    };
    if (item.init) {
      obj.init = parseSection(item.init);
    }
    if (item.test) {
      obj.test = parseSection(item.test);
    }
    if (item.update) {
      obj.update = parseSection(item.update);
    }
    return obj;
  },
  BlockStatement: function (item) {
    return {
      type: 'statement',
      body: item.body.map(function (item) {
        return parseSection(item);
      })
    };
  },
  Literal: function (item) {
    if (item.regex) {
      return {type: 'call', isNew: true, callee: 'RegExp', params: [
        {type: 'raw', data: item.regex.pattern},
        {type: 'raw', data: item.regex.flags}
      ]};
    } else {
      return {type: 'raw', data: item.value};
    }
  },
  ReturnStatement: function (item) {
    return {type: 'return', value: parseSection(item.argument)};
  },
  BinaryExpression: function (item) {
    return {
      type: item.operator,
      values: [parseSection(item.left), parseSection(item.right)]
    };
  },
  ExpressionStatement: function (item) {
    return parseSection(item.expression);
  },
  CallExpression: function (item) {
    return {
      type: 'call',
      callee: parseSection(item.callee),
      params: item.arguments.map(function (item) {
        return parseSection(item);
      })
    };
  },
  MemberExpression: function (item) {
    return {
      type: 'member',
      object: parseSection(item.object),
      property: parseSection(item.property)
    };
  },
  NewExpression: function (item) {
    return {
      type: 'call',
      isNew: true,
      callee: parseSection(item.callee),
      params: item.arguments.map(function (item) {
        return parseSection(item);
      })
    }
  },
  AssignmentExpression: function (item) {
    return {
      type: item.operator,
      left: parseSection(item.left),
      right: parseSection(item.right)
    };
  },
  SequenceExpression: function (item) {
    return {
      type: 'statement',
      body: item.expressions.map(function (item) {
        return parseSection(item);
      })
    };
  },
  IfStatement: function (item) {
    var obj = {
      type: 'if',
      test: parseSection(item.test)
    };
    if (item.consequent) {
      obj.then = parseSection(item.consequent);
    }
    if (item.alternate) {
      obj.else = parseSection(item.alternate);
    }
    return obj;
  },
  LogicalExpression: function (item) {
    return {
      type: item.operator,
      values: [parseSection(item.left), parseSection(item.right)]
    }
  },
  ConditionalExpression: function (item) {
    return {
      type: 'if',
      test: parseSection(item.test),
      then: parseSection(item.consequent),
      else: parseSection(item.alternate)
    }
  },
  ObjectExpression: function (item) {
    return {
      type: '{}',
      properties: item.properties.map(function (item) {
        return [
          parseSection(item.key),
          parseSection(item.value)
        ];
      })
    }
  },
  ArrayExpression: function (item) {
    return {
      type: '[]',
      values: item.elements.map(function (item) {
        return parseSection(item);
      })
    }
  },
  UnaryExpression: function (item) {
    return {
      type: item.operator,
      value: parseSection(item.argument)
    }
  },
  UpdateExpression: function (item) {
    return {
      type: item.operator,
      left: parseSection(item.argument)
    }
  },
  BreakStatement: function (item) {
    return {
      type: 'break'
    }
  },
  EmptyStatement: function (item) {
    return {
      type: 'statement',
      body: []
    }
  },
  TryStatement: function (item) {
    var obj = {
      type: 'try',
      block: parseSection(item.block),
      catch: parseSection(item.handler.body)
    };

    obj.params = [item.handler.param.name];

    return obj;
  },
  ThrowStatement: function (item) {
    return {
      type: 'throw',
      value: parseSection(item.argument)
    }
  },
  WhileStatement: function (item) {
    return {
      type: 'while',
      test: parseSection(item.test),
      body: parseSection(item.body)
    }
  },
  DoWhileStatement: function (item) {
    return {
      type: 'do',
      test: parseSection(item.test),
      body: parseSection(item.body)
    }
  },
  ThisExpression: function (item) {
    return 'this';
  },
  SwitchStatement: function (item) {
    return {
      type: 'statement',
      body: item.cases.map(function (_case) {
        var args;
        if (_case.test === null) {
          args = [true, true];
        } else {
          args = [
            parseSection(item.discriminant),
            parseSection(_case.test)
          ];
        }
        return {
          type: 'if',
          test: {
            type: '===',
            values: args
          },
          then: {
            type: 'statement',
            body: _case.consequent.map(function(item) {
              return parseSection(item);
            })
          }
        }
      })
    }
  },
  LabeledStatement: function (item) {
    return {
      type: '{}',
      properties: [
        [parseSection(item.label),parseSection(item.body)]
      ]
    }
  }
  /*ForInStatement: function (item) {

  }*/
};

var parseSection = function (item) {
  if (item === null) {
    console.log('emptySection', item.type);
    return;
  }

  console.log('parseSection', item.type);

  try {
    var parser = types[item.type];
    if (!parser) {
      throw new Error('Section is not found! ' + item.type);
    }

    return parser(item);
  } catch(e) {
    console.log('Error statement', JSON.stringify(item));
    throw new Error('Section parse error! ' + item.type);
  }
};

var astToJson = function (ast) {
  return ast.body.map(function (item) {
    return parseSection(item);
  });
};

(function () {
  var ast = getAst();
  var interpreter = new Interpreter({
    RegExp: RegExp,
    JSON: JSON,
    console: console
  });

  ast = JSON.parse(JSON.stringify(ast));
  console.log('ast', JSON.stringify(ast));

  var jsonScript = astToJson(ast);
  console.log('jsonScript', JSON.stringify(jsonScript));

  var result = interpreter.runScript(jsonScript);
  console.log('result', result);
})();