/**
 * Created by anton on 15.11.16.
 */
var scope = {};
scope.log = function () {
  console.log.apply(console, arguments);
};

var myScript = [
  {type: 'var', name: 'myFunction', value: {type: 'function', args: ['var1'], value: [
    {type: 'if', condition: {type: 'raw', data: true},
      then: {type: 'function', value: [
        {type: 'return', value: {type: 'raw', data: true}}
      ]},
      else: {type: 'function', value: [
        {type: 'return', value: {type: 'raw', data: true}}
      ]}
    },
    {type: 'if', condition: {type: 'raw', data: true},
      then: {type: 'return', value: {type: 'raw', data: 'abort'}}
    },
    {type: 'var', name: 'test', value: {type: 'raw', data: 'test'}},
    {type: 'assign', var: 'test', value: {type: 'raw', data: 'test 2'}},
    {type: 'exec', value: 'log', args: ['var1']},
    {type: 'return', value: 'test'}
  ]}},
  {type: 'var', name: 'myArr', value: {type: 'raw', data: []}},
  {type: 'var', name: 'myObj', value: {type: 'raw', data: {}}},
  {type: 'var', name: 'myUndefined', value: {type: 'raw', data: undefined}},
  {type: 'var', name: 'myNull', value: {type: 'raw', data: null}},
  {type: 'var', name: 'myRegExp', value: {type: 'regexp', pattern: 'test'}},
  {type: 'var', name: 'myVarA', value: {type: 'raw', data: 1}},
  {type: 'var', name: 'myVarB', value: {type: 'raw', data: 2}},
  {type: 'exec', value: 'log', args: [{type: 'exec', value: 'myFunction', args: [{type: 'raw', data: 'arg1'}]}]},
  {type: 'exec', value: 'log', args: ['myArr']},
  {type: 'exec', value: 'log', args: ['myObj']},
  {type: 'exec', value: 'log', args: ['myUndefined']},
  {type: 'exec', value: 'log', args: ['myNull']},
  {type: 'exec', value: 'log', args: ['myRegExp']},
  {type: 'exec', value: 'log', args: ['myVarA']},
  {type: 'exec', value: 'log', args: ['myVarB']},
  {type: 'exec', value: 'log', args: [
    {type: 'sum', args: ['myVarA', 'myVarB']},
    {type: 'diff', args: ['myVarA', 'myVarB']}
  ]}
];

var buildArgs = function (scope, args) {
  args = args || [];
  var promise = Promise.resolve();
  var fnArgs = new Array(args.length);
  args.forEach(function (command, i) {
    if (typeof command !== 'object') {
      fnArgs[i] = scope[command];
    } else {
      promise = promise.then(function () {
        return runCommand(scope, command);
      }).then(function (value) {
        fnArgs[i] = value;
      });
    }
  });
  return promise.then(function () {
    return fnArgs;
  })
};

var getVariableValue = function (scope, command) {
  var value;
  if (typeof command !== 'object') {
    value = scope[command];
  } else {
    value = runCommand(scope, command);
  }
  return Promise.resolve(value);
};

var getLocalScope = function (scope, context, args, callArgs) {
  callArgs = callArgs || [];
  args = args || [];

  var localScope = Object.create(scope);
  localScope.prototype = scope;
  localScope.arguments = callArgs;
  localScope.this = context;

  args.forEach(function (varible, index) {
    localScope[varible] = callArgs[index];
  });

  return localScope;
};

var getVariableScope = function (scope, variable) {
  var _scope;
  while (!scope.hasOwnProperty(variable)) {
    _scope = scope.prototype;
    if (_scope === undefined) {
      break;
    }
    scope = _scope;
  }
  return scope;
};

var getContext = function (localScope, context) {
  if (context) {
    return localScope[context];
  } else {
    return scope;
  }
};

var commands = {
  var: function (scope, command) {
    return getVariableValue(scope, command.value).then(function (value) {
      scope[command.name] = value;
    });
  },
  exec: function (scope, command) {
    return buildArgs(scope, command.args).then(function (fnArgs) {
      return getVariableValue(scope, command.value).then(function (fn) {
        var context = getContext(scope, command.context);
        return fn.apply(context, fnArgs);
      });
    });
  },
  assign: function (scope, command) {
    return getVariableValue(scope, command.value).then(function (value) {
      var variable = command.var;
      var varScope = getVariableScope(scope, variable);
      varScope[variable] = value;
      return value;
    });
  },
  return: function (scope, command) {
    return getVariableValue(scope, command.value).then(function (value) {
      scope.return = true;
      return value;
    });
  },
  raw: function (scope, command) {
    return command.data;
  },
  regexp: function (scope, command) {
    return new RegExp(command.pattern, command.flags);
  },
  function: function (scope, command) {
    return function () {
      var localScope = getLocalScope(scope, this, command.args, [].slice.call(arguments));
      return execScript(localScope, command.value);
    };
  },
  if: function (scope, command) {
    return getVariableValue(scope, command.condition).then(function (result) {
      if (command.not) {
        result = !result;
      }
      if (result) {
        return getVariableValue(scope, command.then);
      } else {
        return getVariableValue(scope, command.else);
      }
    });
  },
  sum: function (scope, command) {
    return buildArgs(scope, command.args).then(function (args) {
      return args.reduce(function(sum, current) {
        return sum + current;
      }, 0);
    });
  },
  diff: function (scope, command) {
    return buildArgs(scope, command.args).then(function (args) {
      return args.reduce(function(value, current) {
        return value - current;
      }, args.shift());
    });
  },
};

var runCommand = function (scope, command) {
  var type = command.type;
  return commands[type](scope, command);
};

var execScript = function (localScope, script) {
  var index = 0;
  var len = script.length;
  var next = function () {
    var command = script[index++];
    var result = runCommand(localScope, command);
    return Promise.resolve(result).then(function (result) {
      if (len === index || localScope.return === true) {
        return result;
      } else {
        return next();
      }
    });
  };
  return next();
};

(function () {
  return execScript(scope, myScript).then(function () {
    console.log('result', arguments);
  }, function (err) {
    console.error('err', err);
  });
})();

