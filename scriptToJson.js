/**
 * Created by Anton on 16.11.2016.
 */
var acorn = require('acorn');

var types = {
  VariableDeclaration: function (item) {
    return {
      type: item.kind,
      values: item.declarations.map(function (item) {
        if (item.type !== 'VariableDeclarator') {
          throw new Error('Unsupported type!');
        }

        var key = parseSection(item.id, item);
        var value;
        if (item.init) {
          value = parseSection(item.init, item);
        }
        return {key: key, value: value};
      })
    };
  },
  Identifier: function (item, parent) {
    var value = item.name;
    if (item.name === 'undefined') {
      value = undefined;
    }

    if (parent.object !== item && !parent.computed) {
      return {type: 'raw', data: value};
    } else {
      return value;
    }
  },
  FunctionExpression: function (item) {
    return {
      type: 'function',
      params: item.params.map(function (_item) {
        return parseSection(_item, item);
      }),
      body: parseSection(item.body, item)
    };
  },
  FunctionDeclaration: function (item) {
    var value = {
      type: 'function',
      params: item.params.map(function (_item) {
        return parseSection(_item, item);
      }),
      body: parseSection(item.body, item)
    };

    if (item.id) {
      value = {
        type: 'var',
        values: [
          {key: parseSection(item.id, item), value: value}
        ]
      };
    }

    return value;
  },
  ForStatement: function (item) {
    var obj = {
      type: 'for',
      body: parseSection(item.body, item)
    };
    if (item.init) {
      obj.init = parseSection(item.init, item);
    }
    if (item.test) {
      obj.test = parseSection(item.test, item);
    }
    if (item.update) {
      obj.update = parseSection(item.update, item);
    }
    return obj;
  },
  BlockStatement: function (item) {
    return {
      type: 'statement',
      body: item.body.map(function (_item) {
        return parseSection(_item, item);
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
    return {type: 'return', value: parseSection(item.argument, item)};
  },
  BinaryExpression: function (item) {
    return {
      type: item.operator,
      values: [parseSection(item.left, item), parseSection(item.right, item)]
    };
  },
  ExpressionStatement: function (item) {
    return parseSection(item.expression, item);
  },
  CallExpression: function (item) {
    return {
      type: 'call',
      callee: parseSection(item.callee, item),
      params: item.arguments.map(function (_item) {
        return parseSection(_item, item);
      })
    };
  },
  MemberExpression: function (item) {
    return {
      type: 'member',
      object: parseSection(item.object, item),
      property: parseSection(item.property, item)
    };
  },
  NewExpression: function (item) {
    return {
      type: 'call',
      isNew: true,
      callee: parseSection(item.callee, item),
      params: item.arguments.map(function (_item) {
        return parseSection(_item, item);
      })
    }
  },
  AssignmentExpression: function (item) {
    return {
      type: item.operator,
      left: parseSection(item.left, item),
      right: parseSection(item.right, item)
    };
  },
  SequenceExpression: function (item) {
    return {
      type: 'statement',
      body: item.expressions.map(function (_item) {
        return parseSection(_item, item);
      })
    };
  },
  IfStatement: function (item) {
    var obj = {
      type: 'if',
      test: parseSection(item.test, item)
    };
    if (item.consequent) {
      obj.then = parseSection(item.consequent, item);
    }
    if (item.alternate) {
      obj.else = parseSection(item.alternate, item);
    }
    return obj;
  },
  LogicalExpression: function (item) {
    return {
      type: item.operator,
      values: [parseSection(item.left, item), parseSection(item.right, item)]
    }
  },
  ConditionalExpression: function (item) {
    return {
      type: 'if',
      test: parseSection(item.test, item),
      then: parseSection(item.consequent, item),
      else: parseSection(item.alternate, item)
    }
  },
  ObjectExpression: function (item) {
    return {
      type: '{}',
      properties: item.properties.map(function (item) {
        return [
          parseSection(item.key, item),
          parseSection(item.value, item)
        ];
      })
    }
  },
  ArrayExpression: function (item) {
    return {
      type: '[]',
      values: item.elements.map(function (_item) {
        return parseSection(_item, item);
      })
    }
  },
  UnaryExpression: function (item) {
    return {
      type: item.operator,
      value: parseSection(item.argument, item)
    }
  },
  UpdateExpression: function (item) {
    return {
      type: item.operator,
      left: parseSection(item.argument, item)
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
      block: parseSection(item.block, item),
      catch: parseSection(item.handler.body, item.handler)
    };

    obj.params = [item.handler.param.name];

    return obj;
  },
  ThrowStatement: function (item) {
    return {
      type: 'throw',
      value: parseSection(item.argument, item)
    }
  },
  WhileStatement: function (item) {
    return {
      type: 'while',
      test: parseSection(item.test, item),
      body: parseSection(item.body, item)
    }
  },
  DoWhileStatement: function (item) {
    return {
      type: 'do',
      test: parseSection(item.test, item),
      body: parseSection(item.body, item)
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
            parseSection(item.discriminant, item),
            parseSection(_case.test, _case)
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
            body: _case.consequent.map(function(_item) {
              return parseSection(_item, item);
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
        [parseSection(item.label, item),parseSection(item.body, item)]
      ]
    }
  },
  ContinueStatement: function (item) {
    return {
      type: 'continue'
    }
  }
  /*ForInStatement: function (item) {

  }*/
};

var parseSection = function (item, parent) {
  if (item === null) {
    console.log('emptySection', item);
    return;
  }

  var parser = types[item.type];
  if (!parser) {
    console.log('Error statement', JSON.stringify(item));
    throw new Error('Section is not found! ' + item.type);
  }

  return parser(item, parent);
};

var astToJson = function (ast) {
  return ast.body.map(function (item) {
    return parseSection(item, null);
  });
};

var ScriptToJson = function () {

};

ScriptToJson.prototype.getJson = function (code) {
  var ast = acorn.parse(code);

  console.log('ast', JSON.stringify(ast));

  var jsonScript = astToJson(ast);
  return JSON.parse(JSON.stringify(jsonScript));
};

module.exports = ScriptToJson;