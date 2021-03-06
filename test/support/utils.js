/*!
 * node-hbase-client - test/support/utils.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

require('buffer').INSPECT_MAX_BYTES = 1000;

var should = require('should');
var fs = require('fs');
var path = require('path');
var lib = require('../../');
var DataInputStream = lib.DataInputStream;
var DataInputBuffer = lib.DataInputBuffer;

var fixtures = path.join(path.dirname(__dirname), 'fixtures');
exports.fixtures = fixtures;

exports.checkBytes = function (bytes, javaBytes) {
  if (javaBytes.length !== bytes.length) {
    console.log('\njs  :', bytes, '\njava:', javaBytes);
  }
  bytes.length.should.equal(javaBytes.length);
  // console.log(v, bytes, javaBytes)
  // bytes.should.eql(javaBytes);
  for (var i = 0; i < bytes.length; i++) {
    if (bytes[i] !== javaBytes[i]) {
      console.log('\njs  :', bytes, '\njava:', javaBytes);
    }
    bytes[i].should.equal(javaBytes[i]);
  }
};

exports.createTestBytes = function (pathname) {
  return function (method, v, bytes) {
    var javaBytes = fs.readFileSync(path.join(fixtures, pathname, method + '_' + v + '.java.bytes'));

    // console.log('%s(%s): \njs:  ', method, v, bytes, '\njava:', javaBytes);
    if (javaBytes.length !== bytes.length) {
      console.log('%s(%s): \njs  :', method, v, bytes, '\njava:', javaBytes);
    }
    bytes.length.should.equal(javaBytes.length, method + ' ' + v);
    // console.log(v, bytes, javaBytes)
    // bytes.should.eql(javaBytes);
    for (var i = 0; i < bytes.length; i++) {
      if (bytes[i] !== javaBytes[i]) {
        console.log('%s(%s): \njs  :', method, v, bytes, '\njava:', javaBytes);
      }
      bytes[i].should.equal(javaBytes[i]);
    }
  };
};

exports.createDataInputBuffer = function (filename) {
  var filepath = path.join(fixtures, filename + '.java.bytes');
  return new DataInputBuffer(fs.readFileSync(filepath));
};

exports.createTestStream = function (dir, filename) {
  var filepath = path.join(fixtures, dir, filename + '.java.bytes');
  return new DataInputStream(fs.createReadStream(filepath));
};

exports.mockSocket = function () {
  return  {
    bytes: null,
    write: function (bytes, offset, length) {
      offset = offset || 0;
      length = length || bytes.length;
      if (!this.bytes) {
        this.bytes = bytes.slice(offset, length);
      } else {
        this.bytes = Buffer.concat([this.bytes, bytes.slice(offset, length)]);
      }
    }
  };
};
