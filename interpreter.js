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

  _this.initOperators();

  /**
   * @private
   */
  _this.scope = {};
  // _this.scope.this = _this.scope;

  if (customScope) {
    _this.extendScope(customScope);
  }
};

/**
 * @private
 */
Interpreter.prototype.initOperators = function () {
  var _this = this;
  var commands = _this.commands;
  var arith_operators = {
    '+': function (a,b,c) {return c.unary?+b:a+b},
    '-': function (a,b,c) {return c.unary?-b:a-b},
    '*': function (a,b) {return a*b},
    '/': function (a,b) {return a/b},
    '%': function (a,b) {return a%b},
    '>': function (a,b) {return a>b},
    '>=': function (a,b) {return a>=b},
    '<': function (a,b) {return a<b},
    '<=': function (a,b) {return a<=b},
    '==': function (a,b) {return a==b},
    '===': function (a,b) {return a===b},
    '!=': function (a,b) {return a!=b},
    '!==': function (a,b) {return a!==b},
    '&': function (a,b) {return a&b},
    '|': function (a,b) {return a|b},
    '^': function (a,b) {return a^b},
    '<<': function (a,b) {return a<<b},
    '>>': function (a,b) {return a>>b},
    '>>>': function (a,b) {return a>>>b}
  };
  Object.keys(arith_operators).forEach(function (key) {
    var operator = arith_operators[key];
    commands[key] = function (_this, scope, command) {
      var values;
      if (command.unary) {
        values = [0, _this.getValue(scope, command.value)];
      } else {
        values = _this.getValues(scope, command.values);
      }
      return {
        value: operator(values[0], values[1], command)
      };
    };
  });
  var bool_operators = {
    'typeof': function (a) {return typeof a},
    'void': function (a) {return void a},
    '!': function (a) {return !a},
    '~': function (a) {return ~a}
  };
  Object.keys(bool_operators).forEach(function (key) {
    var operator = bool_operators[key];
    commands[key] = function (_this, scope, command) {
      return {
        value: operator(_this.getValue(scope, command.value))
      };
    };
  });
  var assign_operators = {
    '=': function (o,k,s,c) {return o[k]=_this.getValue(s,c)},
    '+=': function (o,k,s,c) {return o[k]+=_this.getValue(s,c)},
    '-=': function (o,k,s,c) {return o[k]-=_this.getValue(s,c)},
    '*=': function (o,k,s,c) {return o[k]*=_this.getValue(s,c)},
    '/=': function (o,k,s,c) {return o[k]/=_this.getValue(s,c)},
    '%=': function (o,k,s,c) {return o[k]%=_this.getValue(s,c)},
    '<<=': function (o,k,s,c) {return o[k]<<=_this.getValue(s,c)},
    '>>=': function (o,k,s,c) {return o[k]>>=_this.getValue(s,c)},
    '>>>=': function (o,k,s,c) {return o[k]>>>=_this.getValue(s,c)},
    '&=': function (o,k,s,c) {return o[k]&=_this.getValue(s,c)},
    '^=': function (o,k,s,c) {return o[k]^=_this.getValue(s,c)},
    '|=': function (o,k,s,c) {return o[k]|=_this.getValue(s,c)}
  };
  Object.keys(assign_operators).forEach(function (key) {
    var operator = assign_operators[key];
    commands[key] = function (_this, scope, command) {
      var left = _this.runCommand(scope, command.left);
      if (left.object === undefined) {
        throw new Error('Operator "' + key + '" error! Left is not defined!');
      }
      return {
        object: left.object,
        key: left.key,
        value: operator(left.object, left.key, scope, command.right)
      };
    };
  });
  var inc_operators = {
    '++': function (o,k,p) {return p ? ++o[k] : o[k]++},
    '--': function (o,k,p) {return p ? --o[k] : o[k]--}
  };
  Object.keys(inc_operators).forEach(function (key) {
    var operator = inc_operators[key];
    commands[key] = function (_this, scope, command) {
      var left = _this.runCommand(scope, command.left);
      if (left.object === undefined) {
        throw new Error('Operator "' + key + '" error! Left is not defined!');
      }
      return {
        object: left.object,
        key: left.key,
        value: operator(left.object, left.key, command.prefix)
      };
    };
  });
  var sab_operators = {
    'in': function (s,a,b) {return _this.getValue(s,a) in _this.getValue(s,b)},
    'instanceof': function (s,a,b) {return _this.getValue(s,a) instanceof _this.getValue(s,b)},
    '&&': function (s,a,b) {return _this.getValue(s,a) && _this.getValue(s,b)},
    '||': function (s,a,b) {return _this.getValue(s,a) || _this.getValue(s,b)}
  };
  Object.keys(sab_operators).forEach(function (key) {
    var operator = sab_operators[key];
    commands[key] = function (_this, scope, command) {
      return {
        value: operator(scope, command.values[0], command.values[1])
      };
    };
  });
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
Interpreter.prototype.getVariableResult = function (scope, variable) {
  if (variable.hasOwnProperty('value')) {
    return variable.value;
  } else {
    return variable.object[variable.key];
  }
};

/**
 * @private
 */
Interpreter.prototype.getValue = function (scope, command) {
  var _this = this;
  var variable = _this.runCommand(scope, command, true);
  return _this.getVariableResult(scope, variable);
};

/**
 * @private
 */
Interpreter.prototype.getValues = function (scope, _values) {
  var _this = this;
  _values = _values || [];
  var len = _values.length;
  var values = new Array(len);
  for (var i = 0; i < len; i++) {
    values[i] = _this.getValue(scope, _values[i]);
  }
  return values;
};

/**
 * @private
 */
Interpreter.prototype.getObjectProperty = function (scope, value, computed) {
  var _this = this;
  var result;
  if (typeof value !== "object" && !computed) {
    result = value;
  } else {
    result = _this.getValue(scope, value);
  }

  return result;
};


Interpreter.prototype.typeMap = {
  undefined: undefined,
  NaN: NaN,
  Infinity: Infinity
};

/**
 * @private
 */
Interpreter.prototype.getLocalScope = function (scope, context, args, callArgs) {
  var localScope = Object.create(scope);
  localScope.__parent__ = scope;
  localScope['arguments'] = callArgs;
  localScope.this = context;

  for (var i = 0, len = args.length; i < len; i++) {
    localScope[args[i]] = callArgs[i];
  }

  return localScope;
};

Interpreter.prototype.argsToArray = [].slice;

/**
 * @private
 */
Interpreter.prototype.SkipResult = {};

/**
 * @private
 */
Interpreter.prototype.commands = {
  var: function (_this, scope, command) {
    var item, key;
    for (var i = 0, len = command.values.length; i < len; i++) {
      item = command.values[i];
      key = _this.getObjectProperty(scope, item.key, item.computed);
      scope[key] = item.value && _this.getValue(scope, item.value);
    }
    return _this.SkipResult;
  },
  call: function (_this, scope, command) {
    var result;

    var callee = _this.runCommand(scope, command.callee);
    var fn;
    if (callee.object === undefined) {
      if (!callee.value) {
        throw new Error('Operator "call" error! Function not defined!');
      }
      callee.object = _this.scope;
      fn = callee.value;
    } else {
      fn = callee.object[callee.key];
    }

    var args = _this.getValues(scope, command.params);
    if (typeof fn !== 'function') {
      throw new Error('Operator "call" error! Value is not a function!');
    }

    if (command.isNew) {
      args.unshift(fn);
      result = new (Function.prototype.bind.apply(fn, args));
    } else {
      result = fn.apply(callee.object, args);
    }

    return {
      value: result
    };
  },
  member: function (_this, scope, command) {
    var object = _this.getValue(scope, command.object);
    var key = _this.getObjectProperty(scope, command.property, command.computed);
    return {
      object: object,
      key: key
    };
  },
  '{}': function (_this, scope, command) {
    var obj = {};
    var properties = command.properties;
    if (properties) {
      for (var i = 0, len = properties.length; i < len; i++) {
        var property = properties[i];
        obj[_this.getObjectProperty(scope, property.key, property.computed)] = _this.getValue(scope, property.value);
      }
    }
    return {
      value: obj
    };
  },
  '[]': function (_this, scope, command) {
    var values = command.values || [];
    var len = values.length;
    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
      if (values[i] !== null) {
        arr[i] = _this.getValue(scope, values[i]);
      }
    }
    return {
      value: arr
    };
  },
  delete: function (_this, scope, command) {
    var variable = _this.runCommand(scope, command.value);
    return {
      value: delete variable.object[variable.key]
    };
  },
  return: function (_this, scope, command) {
    var result = _this.getValue(scope, command.value);
    scope.return = true;
    return {
      value: result
    };
  },
  break: function (_this, scope) {
    scope.break = true;
    return _this.SkipResult;
  },
  continue: function (_this, scope) {
    scope.continue = true;
    return _this.SkipResult;
  },
  raw: function (_this, scope, command) {
    return {
      value: command.data
    };
  },
  function: function (_this, scope, command) {
    var params = command.params || [];
    var func;
    var run = function (_fnThis, _fnArgs) {
      var localScope = _this.getLocalScope(scope, _fnThis, params, _this.argsToArray.call(_fnArgs));
      if (command.name) {
        var key = _this.getObjectProperty(scope, command.name);
        if (!localScope.hasOwnProperty(key)) {
          localScope[key] = func;
        }
      }
      var result = _this.runCommand(localScope, command.body, true);
      if (result === _this.SkipResult) {
        result = undefined;
      }
      if (localScope.hasOwnProperty('return') && localScope.return === true) {
        return _this.getVariableResult(localScope, result);
      }
    };

    switch (params.length) {
      case 1: func = function (a) {return run(this, arguments);}; break;
      case 2: func = function (a,b) {return run(this, arguments);}; break;
      case 3: func = function (a,b,c) {return run(this, arguments);}; break;
      default: func = function () {return run(this, arguments);};
    }

    if (command.name) {
      func.name = _this.getObjectProperty(scope, command.name);
    }

    return {
      value: func
    };
  },
  statement: function (_this, scope, command) {
    var result = _this.execScript(scope, command.body, {value: _this.SkipResult});
    if (result !== _this.SkipResult) {
      result = {
        value: result
      };
    }
    return result;
  },
  if: function (_this, scope, command) {
    var result = _this.SkipResult;
    if (_this.getValue(scope, command.test)) {
      result = _this.runCommand(scope, command.then);
    } else
    if (command.else) {
      result = _this.runCommand(scope, command.else);
    }
    return result;
  },
  for: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    command.init && _this.runCommand(scope, command.init);
    var test = function () {
      if (command.test) {
        return _this.getValue(scope, command.test);
      } else {
        return true;
      }
    };
    var update = function () {
      if (command.update) {
        return _this.getValue(scope, command.update);
      }
    };
    for (;test();update()) {
      prevResult = result;
      result = _this.runCommand(scope, command.body);
      if (result === _this.SkipResult) {
        result = prevResult;
      }
      if (scope.hasOwnProperty('continue') && scope.continue === true) {
        delete scope.continue;
        continue;
      }
      if (scope.hasOwnProperty('break') && scope.break === true) {
        delete scope.break;
        break;
      }
      if (scope.hasOwnProperty('return') && scope.return === true) {
        break;
      }
    }
    return result;
  },
  forIn: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var left = _this.runCommand(scope, command.left);

    var object;
    var key;
    if (command.left.type === 'var') {
      object = scope;
      key = command.left.values[0].key;
    } else {
      object = left.object;
      key = left.key;
    }

    if (object === undefined) {
      throw new Error('Operator "forIn" error! Left is not defined!');
    }

    var obj = _this.getValue(scope, command.right);

    for (var cKey in obj) {
      object[key] = cKey;
      prevResult = result;
      result = _this.runCommand(scope, command.body);
      if (result === _this.SkipResult) {
        result = prevResult;
      }
      if (scope.hasOwnProperty('continue') && scope.continue === true) {
        delete scope.continue;
        continue;
      }
      if (scope.hasOwnProperty('break') && scope.break === true) {
        delete scope.break;
        break;
      }
      if (scope.hasOwnProperty('return') && scope.return === true) {
        break;
      }
    }
    return result;
  },
  while: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var test = function () {
      if (command.test) {
        return _this.getValue(scope, command.test);
      }
    };
    while (test()) {
      prevResult = result;
      result = _this.runCommand(scope, command.body);
      if (result === _this.SkipResult) {
        result = prevResult;
      }
      if (scope.hasOwnProperty('continue') && scope.continue === true) {
        delete scope.continue;
        continue;
      }
      if (scope.hasOwnProperty('break') && scope.break === true) {
        delete scope.break;
        break;
      }
      if (scope.hasOwnProperty('return') && scope.return === true) {
        break;
      }
    }
    return result;
  },
  do: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var test = function () {
      if (command.test) {
        return _this.getValue(scope, command.test);
      }
    };
    do {
      prevResult = result;
      result = _this.runCommand(scope, command.body);
      if (result === _this.SkipResult) {
        result = prevResult;
      }
      if (scope.hasOwnProperty('continue') && scope.continue === true) {
        delete scope.continue;
        continue;
      }
      if (scope.hasOwnProperty('break') && scope.break === true) {
        delete scope.break;
        break;
      }
      if (scope.hasOwnProperty('return') && scope.return === true) {
        break;
      }
    } while (test());
    return result;
  },
  throw: function (_this, scope, command) {
    throw _this.getValue(scope, command.value);
  },
  try: function (_this, scope, command) {
    var result = _this.SkipResult;
    try {
      result = _this.runCommand(scope, command.block);
    } catch (err) {
      if (command.catch) {
        var localScope = _this.getLocalScope(scope, this, command.params, [err]);
        result = _this.runCommand(localScope, command.catch);
      }
    } finally {
      if (command.finally) {
        // note: try finally, result in chrome 54, firefox 50 not replaced
        // in node 4x and edge 38 replaced
        /*result = */_this.runCommand(scope, command.finally);
      }
    }
    return result;
  },
  regexp: function (_this, scope, command) {
    return {
      value: new RegExp(command.pattern, command.flags)
    }
  }
};

/**
 * @private
 */
Interpreter.prototype.getVariableScope = function (scope, variable) {
  while (!scope.hasOwnProperty(variable)) {
    scope = scope.__parent__;
    if (scope === undefined) {
      break;
    }
  }
  return scope;
};

/**
 * @private
 */
Interpreter.prototype.runCommand = function (scope, command, noRootScope) {
  var _this = this;
  var result;
  if (typeof command !== 'object') {
    if (_this.typeMap.hasOwnProperty(command)) {
      result = {
        value: _this.typeMap[command]
      }
    } else {
      result = {
        object: noRootScope ? scope : _this.getVariableScope(scope, command) || scope,
        key: command
      };
    }
  } else {
    result = _this.commands[command.type](_this, scope, command);
  }
  return result;
};

/**
 * @private
 */
Interpreter.prototype.execScript = function (scope, script, result) {
  var _this = this;
  var prevResult, command;
  for (var i = 0, len = script.length; i < len; i++) {
    command = script[i];
    prevResult = result;
    result = _this.runCommand(scope, command);
    if (result === _this.SkipResult) {
      result = prevResult;
    }
    if (
      (scope.hasOwnProperty('return') && scope.return === true) ||
      (scope.hasOwnProperty('break') && scope.break === true) ||
      (scope.hasOwnProperty('continue') && scope.continue === true)
    ) {
      break;
    }
  }
  return _this.getVariableResult(scope, result);
};

Interpreter.prototype.runScript = function (script) {
  var _this = this;
  var scope = _this.scope;
  return _this.execScript(scope, script, {value: undefined});
};

if (typeof module !== 'undefined') {
  module.exports = Interpreter;
} else {
  return Interpreter;
}