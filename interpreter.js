/**
 * Created by anton on 15.11.16.
 */
var Interpreter = function (details) {
  "use strict";
  var _this = this;
  _this.details = details || {};
  _this.scope = {};
  _this.initScope();
};

Interpreter.prototype.initScope = function () {
  var _this = this;
  var details = _this.details;
  var customScope = details.scope || {};
  var scope = _this.scope;

  Object.keys(customScope).forEach(function (key) {
    scope[key] = customScope[key];
  });
};

Interpreter.prototype.getVariable = function (scope, variable) {
  var _this = this;
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

Interpreter.prototype.getVariableFunction = function (localScope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return _this.getVariable(localScope, variable);
  } else {
    return {value: _this.runCommand(localScope, variable), context: _this.scope};
  }
};

Interpreter.prototype.getContext = function (context, localScope, forceContext) {
  var _this = this;
  if (forceContext) {
    return _this.getVariableValue(localScope, forceContext);
  } else {
    return context || _this.scope;
  }
};

Interpreter.prototype.buildArgs =function (scope, args) {
  var _this = this;
  args = args || [];
  var fnArgs = new Array(args.length);
  args.forEach(function (variable, i) {
    fnArgs[i] = _this.getVariableValue(scope, variable);
  });
  return fnArgs;
};

Interpreter.prototype.getVariableValue = function (scope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return _this.getVariable(scope, variable).value;
  } else {
    return _this.runCommand(scope, variable);
  }
};

Interpreter.prototype.getVariableScope = function (scope, _variable) {
  var _this = this;
  var variable = _variable;

  var items = null;
  if (typeof variable === 'string') {
    items = variable.split('.');
    variable = items.shift();
  }

  var _scope;
  while (!scope.hasOwnProperty(variable)) {
    _scope = scope.prototype;
    if (_scope === undefined) {
      break;
    }
    scope = _scope;
  }

  if (items) {
    while (items.length) {
      scope = scope[variable];
      variable = items.shift();
    }
  }

  return scope;
};

Interpreter.prototype.getLocalScope = function (scope, context, args, callArgs) {
  callArgs = callArgs || [];
  args = args || [];

  var localScope = Object.create(scope);
  localScope.prototype = scope;
  localScope['arguments'] = callArgs;
  localScope.this = context;

  args.forEach(function (varible, index) {
    localScope[varible] = callArgs[index];
  });

  return localScope;
};

Interpreter.prototype.commands = {
  var: function (_this, scope, command) {
    scope[command.name] = _this.getVariableValue(scope, command.value);
  },
  call: function (_this, scope, command) {
    var details = _this.getVariableFunction(scope, command.value);
    var context = _this.getContext(details.context, scope, command.context);
    var fnArgs = _this.buildArgs(scope, command.args);
    var fn = details.value;
    if (typeof fn !== 'function') {
      throw new Error('Call ' + JSON.stringify(command.value) + ' is not a function!');
    }
    return fn.apply(context, fnArgs);
  },
  apply: function (_this, scope, command) {
    var details = _this.getVariableFunction(scope, command.value);
    var context = _this.getContext(details.context, scope, command.context);
    var fnArgs = _this.getVariableValue(scope, command.args);
    var fn = details.value;
    if (typeof fn !== 'function') {
      throw new Error('Apply ' + JSON.stringify(command.value) + ' is not a function!');
    }
    return fn.apply(context, fnArgs);
  },
  new: function (_this, scope, command) {
    var details = _this.getVariableFunction(scope, command.value);
    var args = _this.buildArgs(scope, command.args);
    var fn = details.value;
    if (!args.length) {
      return new fn();
    } else
    if (args.length === 1) {
      return new fn(args[0]);
    } else
    if (args.length === 2) {
      return new fn(args[0], args[1]);
    } else
    if (args.length === 3) {
      return new fn(args[0], args[1], args[3]);
    }
  },
  '=': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    var variable = command.var;
    var varScope = _this.getVariableScope(scope, variable);
    varScope[variable] = value;
    return value;
  },
  '+=': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    var variable = command.var;
    var varScope = _this.getVariableScope(scope, variable);
    varScope[variable] += value;
    return value;
  },
  '-=': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    var variable = command.var;
    var varScope = _this.getVariableScope(scope, variable);
    varScope[variable] -= value;
    return value;
  },
  return: function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    scope.return = true;
    return value;
  },
  raw: function (_this, scope, command) {
    return command.data;
  },
  function: function (_this, scope, command) {
    return function () {
      var localScope = _this.getLocalScope(scope, this, command.args, [].slice.call(arguments));
      return _this.execScript(localScope, command.value);
    };
  },
  statement: function (_this, scope, command) {
    return _this.execScript(scope, command.value);
  },
  if: function (_this, scope, command) {
    var result = _this.getVariableValue(scope, command.condition);
    if (command.not) {
      result = !result;
    }
    if (result) {
      return command.then && _this.execScript(scope, command.then);
    } else {
      return command.else && _this.execScript(scope, command.else);
    }
  },
  throw: function (_this, scope, command) {
    throw _this.getVariableValue(scope, command.value);
  },
  try: function (_this, scope, command) {
    var result;
    try {
      result = _this.execScript(scope, command.value);
    } catch (err) {
      if (command.catch) {
        var localScope = _this.getLocalScope(scope, this, command.args, [err]);
        result = _this.execScript(localScope, command.catch);
      }
    }
    return result;
  },
  '+': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.reduce(function(sum, current) {
      return sum + current;
    }, 0);
  },
  '-': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value - current;
    }, args.shift());
  },
  '*': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value * current;
    }, args.shift());
  },
  '/': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.reduce(function(value, current) {
      return value / current;
    }, args.shift());
  },
  '==': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    var first = args.shift();
    return args.every(function (value) {
      return first == value;
    });
  },
  '===': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    var first = args.shift();
    return args.every(function (value) {
      return first === value;
    });
  },
  '&&': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.every(function(value) {
      return !!value;
    });
  },
  '||': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args.some(function(value) {
      return !!value;
    });
  },
  '>': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] > args[1];
  },
  '<': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] < args[1];
  }
};

Interpreter.prototype.runCommand = function (scope, command) {
  var _this = this;
  var type = command.type;
  return _this.commands[type](_this, scope, command);
};

Interpreter.prototype.execScript = function (localScope, script) {
  var _this = this;
  var index = 0;
  var len = script.length;
  var next = function () {
    var command = script[index++];
    var result = _this.runCommand(localScope, command);
    if (len === index || localScope.return === true) {
      return result;
    } else {
      return next();
    }
  };
  return next();
};

Interpreter.prototype.runScript = function (script) {
  var _this = this;
  return _this.execScript(_this.scope, script);
};

module.exports = Interpreter;