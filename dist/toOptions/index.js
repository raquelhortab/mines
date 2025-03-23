'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

exports.default = function (string) {
  var lines = string.split("\n");
  var row_count = 0;
  var column_count = 0;
  var mines = [];
  (0, _lodash.forEach)(lines, function (line) {
    var trim_line = (0, _lodash.trim)(line);
    if (trim_line !== '') {
      var chars = trim_line.split(" ");
      var char_count = chars.length;
      if (char_count > column_count) column_count = char_count;
      (0, _lodash.forEach)(chars, function (char, column_index) {
        if (char === '*') {
          mines.push([row_count, column_index]);
        }
      });
      row_count += 1;
    }
  });
  return {
    dimensions: [row_count, column_count],
    mines: mines
  };
};