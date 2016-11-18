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
    scope = scope.prototype;
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
Interpreter.prototype.commands = {
  var: function (_this, scope, command) {
    var item, key;
    for (var i = 0, len = command.values.length; i < len; i++) {
      item = command.values[i];
      key = _this.getPropValue(scope, item.key);
      scope[key] = item.value && _this.getVariableValue(scope, item.value);
    }
  },
  call: function (_this, scope, command) {
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
        return new (Function.prototype.bind.apply(fn, args));
      } else {
        args.unshift(fn);
        return new (Function.prototype.bind.apply(fn, args));
      }
    } else {
      if (noObject) {
        return fn.apply(_this.scope, args);
      } else {
        return fn.apply(object, args);
      }
    }
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
    command.properties.forEach(function (keyValue) {
      var key = _this.getPropValue(scope, keyValue[0]);
      obj[key] = _this.getVariableValue(scope, keyValue[1]);
    });
    return obj;
  },
  '[]': function (_this, scope, command) {
    var arr = new Array(command.values.length);
    command.values.forEach(function (value, i) {
      arr[i] = _this.getVariableValue(scope, value);
    });
    return arr;
  },
  '=': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var value = _this.getVariableValue(scope, command.right);
    if (objProp.noObject) {
      return value;
    } else {
      return objProp.object[objProp.property] = value;
    }
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
  },
  continue: function (_this, scope, command) {
    scope.continue = true;
  },
  raw: function (_this, scope, command) {
    return command.data;
  },
  function: function (_this, scope, command) {
    return function () {
      var localScope = _this.getLocalScope(scope, this, command.params, [].slice.call(arguments));
      var result = _this.runCommand(localScope, command.body);
      if (localScope.hasOwnProperty('return') && localScope.return === true) {
        return result;
      }
    };
  },
  statement: function (_this, scope, command) {
    return _this.execScript(scope, command.body);
  },
  if: function (_this, scope, command) {
    var result = _this.getVariableValue(scope, command.test);
    if (result) {
      return command.then && _this.runCommand(scope, command.then);
    } else {
      return command.else && _this.runCommand(scope, command.else);
    }
  },
  for: function (_this, scope, command) {
    command.init && _this.runCommand(scope, command.init);
    for (;_this.getVariableValue(scope, command.test);_this.getVariableValue(scope, command.update)) {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (
        (scope.hasOwnProperty('break') && scope.break == true) ||
        (scope.hasOwnProperty('return') && scope.return == true)
      ) {
        delete scope.break;
        break;
      }
    }
  },
  forIn: function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var property = objProp.property;
    var object = objProp.object;

    var noObject = objProp.noObject;
    if (noObject) {
      throw "forIn error! Left is not object!";
    }

    var obj = _this.getVariableValue(scope, command.right);

    for (var key in obj) {
      delete scope.continue;
      object[property] = key;
      _this.runCommand(scope, command.body);
      if (
        (scope.hasOwnProperty('break') && scope.break == true) ||
        (scope.hasOwnProperty('return') && scope.return == true)
      ) {
        delete scope.break;
        break;
      }
    }
  },
  while: function (_this, scope, command) {
    while (_this.getVariableValue(scope, command.test)) {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (
        (scope.hasOwnProperty('break') && scope.break == true) ||
        (scope.hasOwnProperty('return') && scope.return == true)
      ) {
        delete scope.break;
        break;
      }
    }
  },
  do: function (_this, scope, command) {
    do {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (
        (scope.hasOwnProperty('break') && scope.break == true) ||
        (scope.hasOwnProperty('return') && scope.return == true)
      ) {
        delete scope.break;
        break;
      }
    } while (_this.getVariableValue(scope, command.test));
  },
  throw: function (_this, scope, command) {
    throw _this.getVariableValue(scope, command.value);
  },
  try: function (_this, scope, command) {
    var result;
    try {
      result = _this.runCommand(scope, command.block);
    } catch (err) {
      if (command.catch) {
        var localScope = _this.getLocalScope(scope, this, command.params, [err]);
        result = _this.runCommand(localScope, command.catch);
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
  if (typeof command === 'string') {
    return _this.getVariableValue(scope, command);
  } else {
    var type = command.type;
    return _this.commands[type](_this, scope, command);
  }
};

/**
 * @private
 */
Interpreter.prototype.execScript = function (localScope, script) {
  var _this = this;
  var index = 0;
  var len = script.length;
  if (len === 0) {
    return;
  }

  var next = function () {
    var command = script[index++];
    var result = _this.runCommand(localScope, command);
    if (
      len === index ||
      (localScope.hasOwnProperty('return') && localScope.return === true) ||
      (localScope.hasOwnProperty('break') && localScope.break === true) ||
      (localScope.hasOwnProperty('continue') && localScope.continue === true)
    ) {
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