/**
 * Created by Anton on 17.11.2016.
 */
var Interpreter = require('./interpreter');

var myScript = [
  {type: 'var', name: 'myFunction', value: {type: 'function', args: ['var1'], value: [
    {type: 'var', name: 'test', value: {type: 'raw', data: 'test'}},
    {type: '=', var: 'test', value: {type: 'raw', data: 'test 2'}},
    {type: 'if', condition: {type: 'raw', data: true},
      then: [
        {type: 'call', value: 'console.log', args: [{type: 'raw', data: 'if 1 true'}]},
        {type: '=', var: 'myArr', value: {type: 'raw', data: [1]}}
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
        {type: 'call', value: 'console.log', args: [{type: 'raw', data: 'is block statement'}]},
        {type: 'call', value: 'console.log', args: [
          {type: 'statement', value: [
            {type: 'raw', data: 'statement result'},
            {type: 'raw', data: 'statement result last'}
          ]}
        ]}
      ]
    },
    {type: 'call', value: 'console.log', args: ['var1']},
    {type: 'return', value: 'test'}
  ]}},
  {type: 'var', name: 'myFunctionWithContext', value: {type: 'function', args: ['var1'], value: [
    {type: 'call', value: 'console.log', args: ['this', 'var1']}
  ]}},
  {type: 'var', name: 'myArr', value: {type: 'raw', data: []}},
  {type: 'var', name: 'myObj', value: {type: 'raw', data: {}}},
  {type: '=', var: 'myObj.test', value: {type: 'raw', data: 'test obj item'}},
  {type: 'var', name: 'myUndefined', value: {type: 'raw', data: undefined}},
  {type: 'var', name: 'myNull', value: {type: 'raw', data: null}},
  {type: 'var', name: 'myRegExp', value: {type: 'new', value: 'RegExp', args: [{type: 'raw', data: 'test'}]}},
  {type: 'var', name: 'myVarA', value: {type: 'raw', data: 1}},
  {type: 'var', name: 'myVarB', value: {type: 'raw', data: 2}},
  {type: 'call', value: 'console.log', args: [
    {type: 'call', value: 'myFunction', args: [{type: 'raw', data: 'arg1'}]}
  ]},
  {type: 'call', value: 'myFunctionWithContext', context: {type: 'raw', data: {a:1, b: 2}}, args: [
    {type: 'raw', data: 'arg1value'}
  ]},
  {type: 'call', value: 'console.log', args: ['myArr']},
  {type: 'call', value: 'console.log', args: ['myObj', 'myObj.test']},
  {type: 'call', value: 'console.log', args: ['myUndefined']},
  {type: 'call', value: 'console.log', args: ['myNull']},
  {type: 'call', value: 'console.log', args: [
    'myRegExp',
    {type: 'call', value: 'myRegExp.test', args: [{type: 'raw', data: 'test'}]}
  ]},
  {type: 'call', value: 'console.log', args: ['myVarA']},
  {type: 'call', value: 'console.log', args: ['myVarB']},
  {type: 'call', value: 'console.log', args: ['myVarB']},
  {type: 'try', value: [
    {type: 'call', value: 'console.log', args: [{type: 'raw', data: 'in try'}]},
    {type: 'throw', value: {type: 'raw', data: 'Throw hear!'}},
    {type: 'call', value: 'console.log', args: [{type: 'raw', data: 'after throw'}]}
  ], args: ['err'], catch: [
    {type: 'call', value: 'console.log', args: ['err']}
  ]},
  {type: 'call', value: 'console.log', args: [
    {type: '+', args: ['myVarA', 'myVarB']},
    {type: '-', args: ['myVarA', 'myVarB']},
    {type: '*', args: ['myVarA', 'myVarB']},
    {type: '/', args: ['myVarA', 'myVarB']},
    {type: '&&', args: ['myVarA', 'myVarB']},
    {type: '||', args: ['myVarA', 'myVarB']},
    {type: '==', args: ['myVarA', 'myVarB']},
    {type: '===', args: ['myVarA', 'myVarB']},
    {type: '>', args: ['myVarA', 'myVarB']},
    {type: '<', args: ['myVarA', 'myVarB']}
  ]}
];

(function () {
  var interpreter = new Interpreter();
  interpreter.extendScope({
    console: console,
    RegExp: RegExp
  });
  return Promise.resolve().then(function () {
    return interpreter.runScript(myScript);
  }).then(function () {
    console.log('result', arguments);
  }, function (err) {
    console.error(err.stack || err);
  });
})();