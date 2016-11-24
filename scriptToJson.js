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

        var key = parseSection(item.id);
        if (typeof key !== 'string') {
          console.error('VariableDeclaration, Key is not string!', item);
          throw "VariableDeclaration, Key is not string!";
        }

        var value;
        if (item.init) {
          value = parseSection(item.init);
        }
        return {key: key, value: value};
      })
    };
  },
  Identifier: function (item) {
    return item.name;
  },
  FunctionExpression: function (item) {
    var params = item.params.map(function (item) {
      return parseSection(item);
    });
    if (!params.length) {
      params = undefined;
    }
    return {
      type: 'function',
      params: params,
      body: parseSection(item.body)
    };
  },
  FunctionDeclaration: function (item) {
    var params = item.params.map(function (item) {
      return parseSection(item);
    });
    if (!params.length) {
      params = undefined;
    }
    var value = {
      type: 'function',
      params: params,
      body: parseSection(item.body)
    };

    if (item.id) {
      value = {
        type: 'var',
        // functionDeclaration: true,
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
      return {type: 'regexp', pattern: item.regex.pattern, flags: item.regex.flags};
    } else {
      return {type: 'raw', data: item.value};
    }
  },
  ReturnStatement: function (item) {
    var obj;
    if (item.argument === null) {
      obj = {type: 'return'};
    } else {
      obj = {type: 'return', value: parseSection(item.argument)};
    }
    return obj;
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
    var params = item.arguments.map(function (item) {
      return parseSection(item);
    });
    if (!params.length) {
      params = undefined;
    }
    return {
      type: 'call',
      callee: parseSection(item.callee),
      params: params
    };
  },
  MemberExpression: function (item) {
    return {
      type: 'member',
      computed: item.computed,
      object: parseSection(item.object),
      property: parseSection(item.property)
    };
  },
  NewExpression: function (item) {
    var params = item.arguments.map(function (item) {
      return parseSection(item);
    });
    if (!params.length) {
      params = undefined;
    }
    return {
      type: 'call',
      isNew: true,
      callee: parseSection(item.callee),
      params: params
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
    var properties = item.properties.map(function (item) {
      return {
        computed: item.computed,
        key: parseSection(item.key),
        value: parseSection(item.value)
      };
    });
    if (!properties.length) {
      properties = undefined;
    }
    return {
      type: '{}',
      properties: properties
    }
  },
  ArrayExpression: function (item) {
    var values = item.elements.map(function (item) {
      if (item === null) {
        return null;
      } else {
        return parseSection(item);
      }
    });
    if (!values.length) {
      values = undefined;
    }
    return {
      type: '[]',
      values: values
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
      prefix: item.prefix,
      left: parseSection(item.argument)
    }
  },
  BreakStatement: function (item) {
    if (item.label) {
      console.error(JSON.stringify(item));
      throw "Method 'label' is not supported!"
    }

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
      block: parseSection(item.block)
    };

    if (item.handler.body.body.length) {
      obj.params = [item.handler.param.name];
      obj.catch = parseSection(item.handler.body);
    }

    if (item.finalizer) {
      obj.finally = parseSection(item.finalizer);
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
        var test;
        if (_case.test === null) {
          test = {type: 'raw', data: true};
        } else {
          test = {
            type: '===',
            values: [
              parseSection(item.discriminant),
              parseSection(_case.test)
            ]
          };
        }
        return {
          type: 'if',
          test: test,
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
    console.error(JSON.stringify(item));
    throw "LabeledStatement is not supported!";
    /*return {
      type: '{}',
      properties: [
        [parseSection(item.label),parseSection(item.body)]
      ]
    }*/
  },
  ContinueStatement: function (item) {
    if (item.label) {
      console.error(JSON.stringify(item));
      throw "Method 'label' is not supported!"
    }

    return {
      type: 'continue'
    }
  },
  ForInStatement: function (item) {
    return {
      type: 'forIn',
      left: parseSection(item.left),
      right: parseSection(item.right),
      body: parseSection(item.body)
    };
  },
  WithStatement: function (item) {
    console.error(JSON.stringify(item));
    throw "WithStatement is not supported!"
  }
};

var parseSection = function (item) {
  if (item === null) {
    console.trace('emptySection', item);
    return;
  }

  var parser = types[item.type];
  if (!parser) {
    console.log('Error statement', JSON.stringify(item));
    throw new Error('Section is not found! ' + item.type);
  }

  return parser(item);
};

var astToJson = function (ast) {
  return ast.body.map(function (item) {
    return parseSection(item);
  });
};

var ScriptToJson = function (options) {
  this.options = options || {};
};

ScriptToJson.prototype.getJson = function (code) {
  var ast = acorn.parse(code);

  if (this.options.debug) {
    console.log('ast', JSON.stringify(ast));
  }

  var jsonScript = astToJson(ast);
  return JSON.parse(JSON.stringify(jsonScript));
};

module.exports = ScriptToJson;