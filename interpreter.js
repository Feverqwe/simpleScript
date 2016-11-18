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
    property = _this.getPropValue(scope, variable.property);
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
      throw new Error('Call ' + JSON.stringify(callee) + ' is not a function!');
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
    var property = _this.getPropValue(scope, command.property);
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
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    var value = _this.getVariableValue(scope, command.right);

    if (noObject) {
      return value;
    } else {
      return object[property] = value;
    }
  },
  '%=': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    if (noObject) {
      throw "Error! Left is not object!";
    } else {
      return object[property] %= _this.getVariableValue(scope, command.right);
    }
  },
  '+=': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    if (noObject) {
      throw "Error! Left is not object!";
    } else {
      return object[property] += _this.getVariableValue(scope, command.right);
    }
  },
  '-=': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    if (noObject) {
      throw "Error! Left is not object!";
    } else {
      return object[property] -= _this.getVariableValue(scope, command.right);
    }
  },
  '++': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    if (noObject) {
      throw "Error! Left is not object!";
    } else {
      return object[property]++;
    }
  },
  '--': function (_this, scope, command) {
    var objProp = _this.getObjectProperty(scope, command.left);
    var noObject = objProp.noObject;
    var object = objProp.object;
    var property = objProp.property;

    if (noObject) {
      throw "Error! Left is not object!";
    } else {
      return object[property]--;
    }
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
      var localScope = _this.getLocalScope(scope, this, command.params, [].slice.call(arguments));
      var result = _this.runCommand(localScope, command.body);
      if (scope.hasOwnProperty('return') && localScope.return === true) {
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
  break: function (_this, scope, command) {
    scope.break = true;
  },
  continue: function (_this, scope, command) {
    scope.continue = true;
  },
  for: function (_this, scope, command) {
    command.init && _this.runCommand(scope, command.init);
    for (;_this.getVariableValue(scope, command.test);_this.getVariableValue(scope, command.update)) {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (scope.hasOwnProperty('break') && scope.break == true) {
        delete scope.break;
        break;
      }
    }
  },
  while: function (_this, scope, command) {
    while (_this.getVariableValue(scope, command.test)) {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (scope.hasOwnProperty('break') && scope.break == true) {
        delete scope.break;
        break;
      }
    }
  },
  do: function (_this, scope, command) {
    do {
      delete scope.continue;
      _this.runCommand(scope, command.body);
      if (scope.hasOwnProperty('break') && scope.break == true) {
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
  '+': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] + values[1];
  },
  '-': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] - values[1];
  },
  '*': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] * values[1];
  },
  '/': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] / values[1];
  },
  '==': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] == values[1];
  },
  '===': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] === values[1];
  },
  '&&': function (_this, scope, command) {
    return _this.getVariableValue(scope, command.values[0]) && _this.getVariableValue(scope, command.values[1]);
  },
  '||': function (_this, scope, command) {
    return _this.getVariableValue(scope, command.values[0]) || _this.getVariableValue(scope, command.values[1]);
  },
  '>': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] > values[1];
  },
  '<': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] < values[1];
  },
  '>=': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] >= values[1];
  },
  '<=': function (_this, scope, command) {
    var values = _this.buildArgs(scope, command.values);
    return values[0] <= values[1];
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
  if (len === 0) {
    return;
  }

  var next = function () {
    var result;
    var command = script[index++];
    if (typeof command === 'string') {
      result = _this.getVariableValue(localScope, command);
    } else {
      result = _this.runCommand(localScope, command);
    }
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