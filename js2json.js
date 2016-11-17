/**
 * Created by Anton on 16.11.2016.
 */
var acorn = require('acorn');
var Interpreter = require('./interpreter');
var UglifyJS = require("uglify-js");

var getAst = function () {
  var code = function () {

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
      type: 'statement',
      value: item.declarations.map(function (item) {
        return parseSection(item);
      })
    };
  },
  VariableDeclarator: function (item) {
    var id = item.id;
    var value;
    if (item.init) {
      value = parseSection(item.init);
    }
    return {type: 'var', name: id.name, value: value};
  },
  FunctionExpression: function (item) {
    return {
      type: 'function',
      args: paramsToArray(item.params),
      value: parseSection(item.body)
    };
  },
  FunctionDeclaration: function (item) {
    var value = {
      type: 'function',
      args: paramsToArray(item.params),
      value: parseSection(item.body)
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
      value: parseSection(item.body)
    };
    if (item.init) {
      obj.init = parseSection(item.init);
    }
    if (item.condition) {
      obj.condition = parseSection(item.condition);
    }
    if (item.update) {
      obj.update = parseSection(item.update);
    }
    return obj;
  },
  BlockStatement: function (item) {
    return {
      type: 'statement',
      value: item.body.map(function (item) {
        return parseSection(item);
      })
    };
  },
  Literal: function (item) {
    if (item.regex) {
      return {type: 'new', value: 'RegExp', args: [
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
      args: [parseSection(item.left), parseSection(item.right)]
    };
  },
  Identifier: function (item) {
    if (item.name === 'undefined') {
      return;
    } else {
      return item.name;
    }
  },
  ExpressionStatement: function (item) {
    return parseSection(item.expression);
  },
  CallExpression: function (item) {
    var value = parseSection(item.callee);
    var args = item.arguments.map(function (item) {
      return parseSection(item);
    });
    var obj = {
      type: 'call',
      value: value,
      args: args
    };
    return obj;
  },
  MemberExpression: function (item) {
    return {
      type: 'prop',
      value: parseSection(item.object),
      prop: parseSection(item.property)
    };
  },
  AssignmentExpression: function (item) {
    return {
      type: item.operator,
      var: parseSection(item.left),
      value: parseSection(item.right)
    };
  },
  NewExpression: function (item) {
    return {
      type: 'new',
      value: item.callee.name,
      args: item.arguments.map(function (item) {
        return parseSection(item);
      })
    }
  },
  SequenceExpression: function (item) {
    return {
      type: 'statement',
      value: item.expressions.map(function (item) {
        return parseSection(item);
      })
    };
  },
  IfStatement: function (item) {
    var obj = {
      type: 'if',
      condition: parseSection(item.test)
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
      args: [parseSection(item.left), parseSection(item.right)]
    }
  },
  ConditionalExpression: function (item) {
    return {
      type: 'if',
      condition: parseSection(item.test),
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
      elements: item.elements.map(function (item) {
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
      var: parseSection(item.argument)
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
      value: []
    }
  },
  TryStatement: function (item) {
    var obj = {
      type: 'try',
      value: parseSection(item.block),
      catch: parseSection(item.handler.body)
    };

    if (item.handler.param.name) {
      obj.args = [item.handler.param.name];
    }

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
      condition: parseSection(item.test),
      value: parseSection(item.body)
    }
  },
  DoWhileStatement: function (item) {
    return {
      type: 'do',
      condition: parseSection(item.test),
      value: parseSection(item.body)
    }
  },
  ThisExpression: function (item) {
    return 'this';
  },
  SwitchStatement: function (item) {
    return {
      type: 'statement',
      value: item.cases.map(function (_case) {
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
          condition: {
            type: '===',
            args: args
          },
          then: {
            type: 'statement',
            value: _case.consequent.map(function(item) {
              return parseSection(item);
            })
          }
        }
      })
    }
  }
};

var parseSection = function (item) {
  console.log('parseSection', item.type);

  try {
    var parser = types[item.type];
    if (!parser) {
      throw new Error('Section is not found! ' + item.type);
    }
  } catch(e) {
    console.log('Error statement', JSON.stringify(item));
    throw new Error('Section parse error! ' + item.type);
  }

  return parser(item);
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
    console: console
  });

  ast = JSON.parse(JSON.stringify(ast));
  console.log('ast', JSON.stringify(ast));

  var jsonScript = astToJson(ast);
  console.log('jsonScript', JSON.stringify(jsonScript));

  var result = interpreter.runScript(jsonScript);
  console.log('result', result);
})();