/*!
 * node-hbase-client - benchmark.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var HBase = require('./');
var config = require('./test/config');
var utility = require('utility');

var client = HBase.create(config);

var concurrency = parseInt(process.argv[2], 10) || 10;
console.log('concurrency %d', concurrency);

var now = Date.now();

var j = 0;
var i = 0;
var putResult = {
  success: 0,
  fail: 0,
  total: 0,
  use: 0,
  start: 0,
};
var getResult = {
  success: 0,
  fail: 0,
  total: 0,
  use: 0,
  start: 0,
};

var putStop = false;
var getStop = false;
var MAX_NUM = 1000000;

function callPut(callback) {
  if (putStop) {
    return;
  }
  var row = utility.md5('test row' + j++);
  var startTime = Date.now();
  client.putRow('tcif_acookie_user', row, {
    'cf1:history': 'history ' + row + ' ' + j,
    'cf1:qualifier2': 'qualifier2 ' + row + ' ' + j,
  }, function (err) {
    putResult.total++;
    if (putResult.total >= MAX_NUM) {
      console.log('putStop');
      putStop = true;
    }
    putResult.use += Date.now() - startTime;
    if (err) {
      console.log(err);
      putResult.fail++;
    } else {
      putResult.success++;
    }
    if (putStop || putResult.total % 10000 === 0) {
      var use = Date.now() - putResult.start;
      console.log('---------------- Put() --------------------');
      console.log('Concurrency: %d', concurrency);
      console.log('Total: %s ms\nQPS: %d\nRT %d ms', 
        use,
        (putResult.total / use * 1000).toFixed(0), 
        (putResult.use / putResult.total).toFixed(2));
      console.log('Total %d, Success: %d, Fail: %d', putResult.total, putResult.success, putResult.fail);
      console.log('-------------------------------------------');
    }
    callback && callback();
  });
}

function callGet(callback) {
  if (getStop) {
    return;
  }
  var row = utility.md5('test row' + i++);
  var startTime = Date.now();
  var param = new HBase.Get(row);
  param.addColumn('cf1', 'history');
  param.addColumn('cf1', 'qualifier2');
  client.get('tcif_acookie_user', param, function (err, result) {
    // var kvs = result.raw();
    // for (var i = 0; i < kvs.length; i++) {
    //   var kv = kvs[i];
    //   console.log('key: `%s`, value: `%s`', kv.toString(), kv.getValue().toString());
    // }
    getResult.total++;
    if (getResult.total >= MAX_NUM) {
      console.log('getStop');
      getStop = true;
    }
    getResult.use += Date.now() - startTime;
    if (err) {
      console.log(err);
      getResult.fail++;
    } else {
      getResult.success++;
    }
    if (getStop || getResult.total % 10000 === 0) {
      var use = Date.now() - getResult.start;
      console.log('---------------- Get() --------------------');
      console.log('Concurrency: %d', concurrency);
      console.log('Total: %s ms\nQPS: %d\nRT %d ms', 
        use,
        (getResult.total / use * 1000).toFixed(0), 
        (getResult.use / getResult.total).toFixed(2));
      console.log('Total %d, Success: %d, Fail: %d', getResult.total, getResult.success, getResult.fail);
      console.log('-------------------------------------------');
    }
    callback && callback();
  });
}

function callGetRow(callback) {
  if (getStop) {
    return;
  }
  var row = utility.md5('test row' + i++);
  var startTime = Date.now();
  client.getRow('tcif_acookie_user', row, ['cf1:history', 'cf1:qualifier2'], function (err, rows) {
    // console.log(rows)
    
    getResult.total++;
    if (getResult.total >= MAX_NUM) {
      console.log('getStop');
      getStop = true;
    }
    getResult.use += Date.now() - startTime;
    if (err) {
      console.log(err);
      getResult.fail++;
    } else {
      getResult.success++;
    }
    if (getStop || getResult.total % 10000 === 0) {
      var use = Date.now() - getResult.start;
      console.log('---------------- GetRow() --------------------');
      console.log('Concurrency: %d', concurrency);
      console.log('Total: %s ms\nQPS: %d\nRT %d ms', 
        use,
        (getResult.total / use * 1000).toFixed(0), 
        (getResult.use / getResult.total).toFixed(2));
      console.log('Total %d, Success: %d, Fail: %d', getResult.total, getResult.success, getResult.fail);
      console.log('-------------------------------------------');
    }
    callback && callback();
  });
}

var NO = 0;
function runner(fun) {
  console.log('runner#%d start...', NO++);
  var next = function () {
    fun(next);
  };
  next();
}

callGet();

setTimeout(function () {
  for (var i = 0; i < concurrency; i++) {
    // putResult.start = Date.now();
    // runner(callPut);
    
    getResult.start = Date.now();
    // runner(callGet);
    runner(callGetRow);
  }
}, 2000);


// setTimeout(function () {
//   setInterval(function () {
//     callGet();
//     callPut();
//   }, 20);
// }, 1000);
