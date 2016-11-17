/**
 * Created by Anton on 16.11.2016.
 */
var acorn = require('acorn');
var Interpreter = require('./interpreter');

var getAst = function () {
  var code = function () {
    var f = function (a) {
      return a * 2;
    };
    var a = 10;
    a += 2;
    var b = 2;
    var r = new RegExp('test');
    var c = 'asdasdasd';
    c = c.substr(0, 4), c += '123';
    console.log(f(a / b), r.test('test'), c);
    (function () {
      console.log('ye!!!')
    })();
  };
  code = code.toString();
  code = code.substr(code.indexOf('{') + 1);
  code = code.substr(0, code.lastIndexOf('}'));
  console.log('code', code);

  return acorn.parse(code);
};

var paramsToArray = function (params) {
  return params.map(function (item) {
    return item.name;
  });
};

var types = {
  VariableDeclaration: function (item) {
    if (item.declarations.length > 1) {
      console.error('More one decloration!', item);
      throw 'Error! ore one decloration!'
    }
    return parseSection(item.declarations[0]);
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
  BlockStatement: function (item) {
    return item.body.map(function (item) {
      return parseSection(item);
    });
  },
  Literal: function (item) {
    return {type: 'raw', data: item.value};
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
    return item.name;
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
    var obj = item.object.name;
    if (item.property) {
      obj += '.' + item.property.name;
    }
    return obj;
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
  }
};

var parseSection = function (item) {
  if (item === undefined) {
    console.trace(item)
  }
  var parser = types[item.type];
  if (!parser) {
    console.error('Section is not found', item.type);
    throw new Error("Section is not found!");
  }
  console.log('parse', item.type);
  return parser(item);
};

var astToJson = function (ast) {
  return ast.body.map(function (item) {
    return parseSection(item);
  });
};

(function () {
  var ast = getAst();
  var interpreter = new Interpreter();

  ast = JSON.parse(JSON.stringify(ast));
  console.log('ast', JSON.stringify(ast));

  astToJson(ast);
  console.log('json', JSON.stringify(statement));

  interpreter.runScript(statement);
})();