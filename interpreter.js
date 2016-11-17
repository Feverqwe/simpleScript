/**
 * Created by anton on 15.11.16.
 */

/**
 * @param {Object} customScope
 * @constructor
 */
var Interpreter = function (customScope) {
  "use strict";
  var _this = this;
  /**
   * @private
   */
  _this.scope = {};

  if (customScope) {
    _this.extendScope(customScope);
  }
};

Interpreter.prototype.extendScope = function (customScope) {
  var _this = this;
  var scope = _this.scope;

  customScope && Object.keys(customScope).forEach(function (key) {
    scope[key] = customScope[key];
  });
};

/**
 * @private
 */
Interpreter.prototype.getVariable = function (scope, variable) {
  var _this = this;
  return {value: scope[variable], context: scope};
};

/**
 * @private
 */
Interpreter.prototype.getVariableScope = function (scope, variable) {
  var _this = this;

  while (!scope.hasOwnProperty(variable)) {
    scope = scope.prototype;
    if (scope === undefined) {
      break;
    }
  }

  return scope;
};

Interpreter.prototype.getPropValue = function (scope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return variable;
  } else {
    return _this.runCommand(scope, variable);
  }
};

Interpreter.prototype.getVariableScopeProp = function (scope, variable) {
  var _this = this;
  if (typeof variable === 'string') {
    return {
      scope: _this.getVariableScope(scope, variable) || _this.scope,
      var: variable
    };
  } else
  if (variable.type === 'prop') {
    return {
      scope: _this.getVariableValue(scope, variable.value),
      var: _this.getPropValue(scope, variable.prop)
    };
  } else {
    return {
      noScope: true,
      var: _this.runCommand(scope, variable)
    };
  }
};

/**
 * @private
 */
Interpreter.prototype.getVariableFunction = function (localScope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return _this.getVariable(localScope, variable);
  } else
  if (variable.type === 'prop') {
    return _this.getVariable(_this.getVariableValue(localScope, variable.value), _this.getPropValue(localScope, variable.prop));
  } else {
    return {value: _this.runCommand(localScope, variable), context: _this.scope};
  }
};

/**
 * @private
 */
Interpreter.prototype.getContext = function (context, localScope, forceContext) {
  var _this = this;
  if (forceContext) {
    return _this.getVariableValue(localScope, forceContext);
  } else {
    return context || _this.scope;
  }
};

/**
 * @private
 */
Interpreter.prototype.buildArgs = function (scope, args) {
  var _this = this;
  args = args || [];
  var fnArgs = new Array(args.length);
  args.forEach(function (variable, i) {
    fnArgs[i] = _this.getVariableValue(scope, variable);
  });
  return fnArgs;
};

/**
 * @private
 */
Interpreter.prototype.getVariableValue = function (scope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return _this.getVariable(scope, variable).value;
  } else {
    return _this.runCommand(scope, variable);
  }
};

/**
 * @private
 */
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

/**
 * @private
 */
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
    if (typeof fn !== 'function') {
      throw new Error('new Function ' + JSON.stringify(command.value) + ' is not a function!');
    }
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
  'prop': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    var prop = _this.getPropValue(scope, command.prop);
    return value[prop];
  },
  '{}': function (_this, scope, command) {
    var obj = {};
    command.properties.forEach(function (keyValue) {
      var key = keyValue[0];
      obj[key] = _this.getVariableValue(scope, keyValue[1]);
    });
    return obj;
  },
  '[]': function (_this, scope, command) {
    var arr = new Array(command.elements.length);
    command.elements.forEach(function (value, i) {
      arr[i] = _this.getVariableValue(scope, value);
    });
    return arr;
  },
  '=': function (_this, scope, command) {
    var scopeProperty = _this.getVariableScopeProp(scope, command.var);
    var vScope = scopeProperty.scope;
    var variable = scopeProperty.var;
    var value = _this.getVariableValue(scope, command.value);
    if (!scopeProperty.noScope) {
      vScope[variable] = value
    }
    return value;
  },
  '+=': function (_this, scope, command) {
    var scopeProperty = _this.getVariableScopeProp(scope, command.var);
    var vScope = scopeProperty.scope;
    var variable = scopeProperty.var;
    var value = _this.getVariableValue(scope, command.value);
    return vScope[variable] += value
  },
  '-=': function (_this, scope, command) {
    var scopeProperty = _this.getVariableScopeProp(scope, command.var);
    var vScope = scopeProperty.scope;
    var variable = scopeProperty.var;
    var value = _this.getVariableValue(scope, command.value);
    return vScope[variable] -= value
  },
  '++': function (_this, scope, command) {
    var scopeProperty = _this.getVariableScopeProp(scope, command.var);
    var vScope = scopeProperty.scope;
    var variable = scopeProperty.var;
    return vScope[variable]++;
  },
  '--': function (_this, scope, command) {
    var scopeProperty = _this.getVariableScopeProp(scope, command.var);
    var vScope = scopeProperty.scope;
    var variable = scopeProperty.var;
    return vScope[variable]--;
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
      var result = _this.runCommand(localScope, command.value);
      if (localScope.return === true) {
        return result;
      }
    };
  },
  statement: function (_this, scope, command) {
    return _this.execScript(scope, command.value);
  },
  if: function (_this, scope, command) {
    var result = _this.getVariableValue(scope, command.condition);
    if (result) {
      return command.then && _this.runCommand(scope, command.then);
    } else {
      return command.else && _this.runCommand(scope, command.else);
    }
  },
  break: function (_this, scope, command) {
    scope.break = true;
  },
  for: function (_this, scope, command) {
    command.init && _this.runCommand(scope, command.init);
    for (;_this.getVariableValue(scope, command.condition);_this.getVariableValue(scope, command.update)) {
      _this.runCommand(scope, command.value);
      if (scope.break == true) {
        delete scope.break;
        break;
      }
    }
  },
  while: function (_this, scope, command) {
    while (_this.getVariableValue(scope, command.condition)) {
      _this.runCommand(scope, command.value);
      if (scope.break == true) {
        delete scope.break;
        break;
      }
    }
  },
  do: function (_this, scope, command) {
    do {
      _this.runCommand(scope, command.value);
      if (scope.break == true) {
        delete scope.break;
        break;
      }
    } while (_this.getVariableValue(scope, command.condition));
  },
  throw: function (_this, scope, command) {
    throw _this.getVariableValue(scope, command.value);
  },
  try: function (_this, scope, command) {
    var result;
    try {
      result = _this.runCommand(scope, command.value);
    } catch (err) {
      if (command.catch) {
        var localScope = _this.getLocalScope(scope, this, command.args, [err]);
        result = _this.runCommand(localScope, command.catch);
      }
    }
    return result;
  },
  '+': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] + args[1];
  },
  '-': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] - args[1];
  },
  '*': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] * args[1];
  },
  '/': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] / args[1];
  },
  '==': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] == args[1];
  },
  '===': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] === args[1];
  },
  '&&': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] && args[1];
  },
  '||': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] || args[1];
  },
  '>': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] > args[1];
  },
  '<': function (_this, scope, command) {
    var args = _this.buildArgs(scope, command.args);
    return args[0] < args[1];
  },
  'void': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    return void value;
  },
  '!': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    return !value;
  },
  'typeof': function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    return typeof value;
  }
};

/**
 * @private
 */
Interpreter.prototype.runCommand = function (scope, command) {
  var _this = this;
  var type = command.type;
  return _this.commands[type](_this, scope, command);
};

/**
 * @private
 */
Interpreter.prototype.execScript = function (localScope, script) {
  var _this = this;
  var index = 0;
  var len = script.length;
  var next = function () {
    var command = script[index++];
    var result = _this.runCommand(localScope, command);
    if (len === index || localScope.return === true || localScope.break === true) {
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