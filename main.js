/**
 * Created by anton on 15.11.16.
 */
var scope = {};
scope.log = function () {
  console.log.apply(console, arguments);
};
scope.console = console;

var myScript = [
  {type: 'var', name: 'myFunction', value: {type: 'function', args: ['var1'], value: [
    {type: 'var', name: 'test', value: {type: 'raw', data: 'test'}},
    {type: 'assign', var: 'test', value: {type: 'raw', data: 'test 2'}},
    {type: 'if', condition: {type: 'raw', data: true},
      then: [
        {type: 'exec', value: 'log', args: [{type: 'raw', data: 'if 1 true'}]},
        {type: 'assign', var: 'myArr', value: {type: 'raw', data: [1]}}
      ],
      else: [
        {type: 'return', value: {type: 'raw', data: false}}
      ]
    },
    {type: 'if', not: true, condition: {type: 'raw', data: true},
      then: [
          {type: 'return', value: {type: 'raw', data: 'abort'}}
      ]
    },
    {type: 'if', condition: {type: 'raw', data: true},
      then: [
        {type: 'exec', value: 'console.log', args: [{type: 'raw', data: 'is block statement'}]},
        {type: 'exec', value: 'console.log', args: [
          {type: 'statement', value: [
            {type: 'raw', data: 'statement result'},
            {type: 'raw', data: 'statement result last'}
          ]}
        ]}
      ]
    },
    {type: 'exec', value: 'log', args: ['var1']},
    {type: 'return', value: 'test'}
  ]}},
  {type: 'var', name: 'myArr', value: {type: 'raw', data: []}},
  {type: 'var', name: 'myObj', value: {type: 'raw', data: {}}},
  {type: 'assign', var: 'myObj.test', value: {type: 'raw', data: 'test obj item'}},
  {type: 'var', name: 'myUndefined', value: {type: 'raw', data: undefined}},
  {type: 'var', name: 'myNull', value: {type: 'raw', data: null}},
  {type: 'var', name: 'myRegExp', value: {type: 'regexp', pattern: 'test'}},
  {type: 'var', name: 'myVarA', value: {type: 'raw', data: 1}},
  {type: 'var', name: 'myVarB', value: {type: 'raw', data: 2}},
  {type: 'exec', value: 'log', args: [
      {type: 'exec', value: 'myFunction', args: [{type: 'raw', data: 'arg1'}]}
  ]},
  {type: 'exec', value: 'log', args: ['myArr']},
  {type: 'exec', value: 'log', args: ['myObj', 'myObj.test']},
  {type: 'exec', value: 'log', args: ['myUndefined']},
  {type: 'exec', value: 'log', args: ['myNull']},
  {type: 'exec', value: 'log', args: [
    'myRegExp',
    {type: 'exec', value: 'myRegExp.test', args: [{type: 'raw', data: 'test'}]}
  ]},
  {type: 'exec', value: 'log', args: ['myVarA']},
  {type: 'exec', value: 'log', args: ['myVarB']},
  {type: 'exec', value: 'console.log', args: ['myVarB']},
  {type: 'try', value: [
    {type: 'exec', value: 'console.log', args: [{type: 'raw', data: 'in try'}]},
    {type: 'throw', value: {type: 'raw', data: 'Throw hear!'}},
    {type: 'exec', value: 'console.log', args: [{type: 'raw', data: 'after throw'}]}
  ], args: ['err'], catch: [
    {type: 'exec', value: 'console.log', args: ['err']}
  ]},
  {type: 'exec', value: 'log', args: [
    {type: '+', args: ['myVarA', 'myVarB']},
    {type: '-', args: ['myVarA', 'myVarB']},
    {type: '*', args: ['myVarA', 'myVarB']},
    {type: '/', args: ['myVarA', 'myVarB']}
  ]}
];

var getVariable = function (scope, variable) {
  if (typeof variable !== 'string') {
    return {value: scope[variable], context: scope};
  }

  var items = variable.split('.');

  var context = scope;
  var value = scope[items.shift()];
  while (items.length) {
    context = value;
    value = context[items.shift()];
  }

  return {value: value, context: context};
};

var buildArgs = function (scope, args) {
  args = args || [];
  var fnArgs = new Array(args.length);
  args.forEach(function (variable, i) {
    if (typeof variable !== 'object') {
      fnArgs[i] = getVariable(scope, variable).value;
    } else {
      fnArgs[i] = runCommand(scope, variable);
    }
  });
  return fnArgs;
};

var getVariableValue = function (scope, variable) {
  if (typeof variable !== 'object') {
    return getVariable(scope, variable).value;
  } else {
    return runCommand(scope, variable);
  }
};

var getVariableFunction = function (localScope, variable) {
  if (typeof variable !== 'object') {
    return getVariable(localScope, variable);
  } else {
    return {context: scope, value: runCommand(localScope, variable)};
  }
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

var getContext = function (context, localScope, forceContext) {
  if (forceContext) {
    return localScope[forceContext];
  } else {
    return context || scope;
  }
};

var commands = {
  var: function (scope, command) {
    scope[command.name] = getVariableValue(scope, command.value);
  },
  exec: function (scope, command) {
    var details = getVariableFunction(scope, command.value);
    var fnArgs = buildArgs(scope, command.args);
    var fn = details.value;
    if (typeof fn !== 'function') {
      throw new Error('Exec ' + JSON.stringify(command.value) + ' is not a function!');
    }
    var context = getContext(details.context, scope, command.context);
    return fn.apply(context, fnArgs);
  },
  assign: function (scope, command) {
    var value = getVariableValue(scope, command.value);
    var variable = command.var;
    var varScope;
    if (typeof variable !== 'string') {
      varScope = getVariableScope(scope, variable);
    } else {
      var items = variable.split('.');
      variable = items.shift();
      varScope = getVariableScope(scope, variable);
      while (items.length) {
        varScope = varScope[variable];
        variable = items.shift();
      }
    }
    varScope[variable] = value;
    return value;
  },
  return: function (scope, command) {
    var value = getVariableValue(scope, command.value);
    scope.return = true;
    return value;
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
  statement: function (scope, command) {
    return execScript(scope, command.value);
  },
  if: function (scope, command) {
    var result = getVariableValue(scope, command.condition);
    if (command.not) {
      result = !result;
    }
    if (result) {
      return command.then && execScript(scope, command.then);
    } else {
      return command.else && execScript(scope, command.else);
    }
  },
  throw: function (scope, command) {
    throw getVariableValue(scope, command.value);
  },
  try: function (scope, command) {
    var result;
    try {
      result = execScript(scope, command.value);
    } catch (err) {
      if (command.catch) {
        var localScope = getLocalScope(scope, this, command.args, [err]);
        result = execScript(localScope, command.catch);
      }
    }
    return result;
  },
  '+': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.reduce(function(sum, current) {
      return sum + current;
    }, 0);
  },
  '-': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value - current;
    }, args.shift());
  },
  '*': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value / current;
    }, args.shift());
  },
  '/': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value * current;
    }, args.shift());
  },
  '==': function (scope, command) {
    var args = buildArgs(scope, command.args);
    var first = args.shift();
    return args.every(function (value) {
      return first == value;
    });
  },
  '===': function (scope, command) {
    var args = buildArgs(scope, command.args);
    var first = args.shift();
    return args.every(function (value) {
      return first === value;
    });
  },
  '&&': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.every(function(value) {
      return !!value;
    });
  },
  '||': function (scope, command) {
    var args = buildArgs(scope, command.args);
    return args.some(function(value) {
      return !!value;
    });
  }
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
    if (len === index || localScope.return === true) {
      return result;
    } else {
      return next();
    }
  };
  return next();
};

(function () {
  return Promise.resolve().then(function () {
    return execScript(scope, myScript);
  }).then(function () {
    console.log('result', arguments);
  }, function (err) {
    console.error(err.stack || err);
  });
})();