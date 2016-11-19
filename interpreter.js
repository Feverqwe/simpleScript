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
  var dbl_operators = {
    '+': function (a,b) {return a+b},
    '-': function (a,b) {return a-b},
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
  Object.keys(dbl_operators).forEach(function (key) {
    var operator = dbl_operators[key];
    commands[key] = function (_this, scope, command) {
      var values;
      if (command.value !== undefined) {
        values = [0, _this.getVariableValue(scope, command.value)];
      } else {
        values = _this.buildArgs(scope, command.values);
      }
      return operator(values[0], values[1]);
    };
  });
  var one_operators = {
    'typeof': function (a) {return typeof a},
    'void': function (a) {return void a},
    '!': function (a) {return !a},
    '~': function (a) {return ~a}
  };
  Object.keys(one_operators).forEach(function (key) {
    var operator = one_operators[key];
    commands[key] = function (_this, scope, command) {
      var value = _this.getVariableValue(scope, command.value);
      return operator(value);
    };
  });
  var assign_operators = {
    '+=': function (o,p,s,c) {return o[p]+=_this.getVariableValue(s,c)},
    '-=': function (o,p,s,c) {return o[p]-=_this.getVariableValue(s,c)},
    '*=': function (o,p,s,c) {return o[p]*=_this.getVariableValue(s,c)},
    '/=': function (o,p,s,c) {return o[p]/=_this.getVariableValue(s,c)},
    '%=': function (o,p,s,c) {return o[p]%=_this.getVariableValue(s,c)},
    '<<=': function (o,p,s,c) {return o[p]<<=_this.getVariableValue(s,c)},
    '>>=': function (o,p,s,c) {return o[p]>>=_this.getVariableValue(s,c)},
    '>>>=': function (o,p,s,c) {return o[p]>>>=_this.getVariableValue(s,c)},
    '&=': function (o,p,s,c) {return o[p]&=_this.getVariableValue(s,c)},
    '^=': function (o,p,s,c) {return o[p]^=_this.getVariableValue(s,c)},
    '|=': function (o,p,s,c) {return o[p]|=_this.getVariableValue(s,c)}
  };
  Object.keys(assign_operators).forEach(function (key) {
    var operator = assign_operators[key];
    commands[key] = function (_this, scope, command) {
      var objProp = _this.getObjectProperty(scope, command.left);
      if (objProp.noObject) {
        throw "Error! Left is not object!";
      }
      return operator(objProp.object, objProp.property, scope, command.right);
    };
  });
  var inc_operators = {
    '++': function (o,p,c) {return c.prefix ? ++o[p] : o[p]++},
    '--': function (o,p,c) {return c.prefix ? --o[p] : o[p]--}
  };
  Object.keys(inc_operators).forEach(function (key) {
    var operator = inc_operators[key];
    commands[key] = function (_this, scope, command) {
      var objProp = _this.getObjectProperty(scope, command.left);
      if (objProp.noObject) {
        throw "Error! Left is not object!";
      }
      return operator(objProp.object, objProp.property, command);
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
Interpreter.prototype.getVariableScope = function (scope, variable) {
  var _this = this;
  while (!scope.hasOwnProperty(variable)) {
    scope = scope.__parent__;
    if (scope === undefined) {
      break;
    }
  }
  return scope || _this.scope;
};

/**
 * @private
 */
Interpreter.prototype.getPropValue = function (scope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return variable;
  } else {
    return _this.runCommand(scope, variable);
  }
};

/**
 * @private
 */
Interpreter.prototype.buildArgs = function (scope, args) {
  var _this = this;
  args = args || [];
  var len = args.length;
  var fnArgs = new Array(len);
  for (var i = 0; i < len; i++) {
    fnArgs[i] = _this.getVariableValue(scope, args[i]);
  }
  return fnArgs;
};

/**
 * @private
 */
Interpreter.prototype.getVariableValue = function (scope, variable) {
  var _this = this;
  if (typeof variable !== 'object') {
    return scope[variable];
  } else {
    return _this.runCommand(scope, variable);
  }
};

/**
 * @private
 */
Interpreter.prototype.getLocalScope = function (scope, context, args, callArgs) {
  callArgs = callArgs || [];

  var localScope = Object.create(scope);
  localScope.__parent__ = scope;
  localScope['arguments'] = callArgs;
  localScope.this = context;

  if (args) {
    for (var i = 0, len = args.length; i < len; i++) {
      localScope[args[i]] = callArgs[i];
    }
  }

  return localScope;
};

/**
 * @private
 */
Interpreter.prototype.getObjectProperty = function (scope, variable) {
  var _this = this;
  var noObject = false;
  var object;
  var property;

  if (typeof variable !== 'object') {
    object = _this.getVariableScope(scope, variable);
    property = variable;
  } else
  if (variable.type === 'member') {
    object = _this.getVariableValue(scope, variable.object);
    if (variable.computed) {
      property = _this.getVariableValue(scope, variable.property);
    } else {
      property = _this.getPropValue(scope, variable.property);
    }
  } else
  if (variable.type === 'var') {
    _this.runCommand(scope, variable);
    object = scope;
    property = variable.values[0].key;
  } else {
    noObject = true;
  }

  return {object: object, noObject: noObject, property: property};
};

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
      key = _this.getPropValue(scope, item.key);
      scope[key] = item.value && _this.getVariableValue(scope, item.value);
    }
    return _this.SkipResult;
  },
  call: function (_this, scope, command) {
    var result;
    var objProp = _this.getObjectProperty(scope, command.callee);
    var property = objProp.property;
    var object = objProp.object;
    var noObject = objProp.noObject;
    var fn;
    if (objProp.noObject) {
      fn = _this.getVariableValue(scope, command.callee);
    } else {
      fn = object[property];
    }

    var args = _this.buildArgs(scope, command.params);

    if (typeof fn !== 'function') {
      throw new Error('Call ' + JSON.stringify(command.callee) + ' is not a function!');
    }

    if (command.isNew) {
      if (noObject) {
        args.unshift(_this.scope);
        result = new (Function.prototype.bind.apply(fn, args));
      } else {
        args.unshift(fn);
        result = new (Function.prototype.bind.apply(fn, args));
      }
    } else {
      if (noObject) {
        result = fn.apply(_this.scope, args);
      } else {
        result = fn.apply(object, args);
      }
    }
    return result;
  },
  member: function (_this, scope, command) {
    var object = _this.getVariableValue(scope, command.object);
    var property;
    if (command.computed) {
      property = _this.getVariableValue(scope, command.property);
    } else {
      property = _this.getPropValue(scope, command.property);
    }
    return object[property];
  },
  '{}': function (_this, scope, command) {
    var obj = {};
    var keyValue;
    var properties = command.properties;
    if (properties) {
      for (var i = 0, len = properties.length; i < len; i++) {
        keyValue = properties[i];
        obj[_this.getPropValue(scope, keyValue[0])] = _this.getVariableValue(scope, keyValue[1]);
      }
    }
    return obj;
  },
  '[]': function (_this, scope, command) {
    var values = command.values || [];
    var len = values.length;
    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
      arr[i] = _this.getVariableValue(scope, values[i]);
    }
    return arr;
  },
  '=': function (_this, scope, command) {
    var result;
    var objProp = _this.getObjectProperty(scope, command.left);
    var value = _this.getVariableValue(scope, command.right);
    if (objProp.noObject) {
      result = value;
    } else {
      result = objProp.object[objProp.property] = value;
    }
    return result;
  },
  delete: function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.value);
    return delete objProp.object[objProp.property];
  },
  in: function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return (values[0] in values[1]);
  },
  instanceof: function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return (values[0] instanceof values[1]);
  },
  return: function (_this, scope, command) {
    var value = _this.getVariableValue(scope, command.value);
    scope.return = true;
    return value;
  },
  break: function (_this, scope, command) {
    scope.break = true;
    return _this.SkipResult;
  },
  continue: function (_this, scope, command) {
    scope.continue = true;
    return _this.SkipResult;
  },
  raw: function (_this, scope, command) {
    return command.data;
  },
  function: function (_this, scope, command) {
    return function () {
      var localScope = _this.getLocalScope(scope, this, command.params, [].slice.call(arguments));
      var result = _this.runCommand(localScope, command.body);
      if (result === _this.SkipResult) {
        result = undefined;
      }
      if (localScope.hasOwnProperty('return') && localScope.return === true) {
        return result;
      }
    };
  },
  statement: function (_this, scope, command) {
    return _this.execScript(scope, command.body, _this.SkipResult);
  },
  if: function (_this, scope, command) {
    var result = _this.SkipResult;
    if (_this.getVariableValue(scope, command.test)) {
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
        return _this.getVariableValue(scope, command.test);
      } else {
        return true;
      }
    };
    var update = function () {
      if (command.update) {
        return _this.getVariableValue(scope, command.update);
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
        return result;
      }
    }
    return result;
  },
  forIn: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var objProp = _this.getObjectProperty(scope, command.left);
    var property = objProp.property;
    var object = objProp.object;

    var noObject = objProp.noObject;
    if (noObject) {
      throw "forIn error! Left is not object!";
    }

    var obj = _this.getVariableValue(scope, command.right);

    for (var key in obj) {
      object[property] = key;
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
        return result;
      }
    }
    return result;
  },
  while: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var test = function () {
      if (command.test) {
        return _this.getVariableValue(scope, command.test);
      } else {
        return true;
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
        return result;
      }
    }
    return result;
  },
  do: function (_this, scope, command) {
    var result = _this.SkipResult, prevResult;
    var test = function () {
      if (command.test) {
        return _this.getVariableValue(scope, command.test);
      } else {
        return true;
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
        return result;
      }
    } while (test());
    return result;
  },
  throw: function (_this, scope, command) {
    throw _this.getVariableValue(scope, command.value);
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
  '&&': function (_this, scope, command) {
    return _this.getVariableValue(scope, command.values[0]) && _this.getVariableValue(scope, command.values[1]);
  },
  '||': function (_this, scope, command) {
    return _this.getVariableValue(scope, command.values[0]) || _this.getVariableValue(scope, command.values[1]);
  }
};

/**
 * @private
 */
Interpreter.prototype.runCommand = function (scope, command) {
  var _this = this;
  if (typeof command !== 'object') {
    return _this.getVariableValue(scope, command);
  } else {
    var type = command.type;
    return _this.commands[type](_this, scope, command);
  }
};

/**
 * @private
 */
Interpreter.prototype.execScript = function (localScope, script, result) {
  var _this = this;
  var prevResult, command;
  for (var i = 0, len = script.length; i < len; i++) {
    command = script[i];
    prevResult = result;
    result = _this.runCommand(localScope, command);
    if (result === _this.SkipResult) {
      result = prevResult;
    }
    if (
      (localScope.hasOwnProperty('return') && localScope.return === true) ||
      (localScope.hasOwnProperty('break') && localScope.break === true) ||
      (localScope.hasOwnProperty('continue') && localScope.continue === true)
    ) {
      break;
    }
  }
  return result;
};

Interpreter.prototype.runScript = function (script) {
  var _this = this;
  return _this.execScript(_this.scope, script);
};

module.exports = Interpreter;