"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require("lodash");

exports.default = function (cells) {
  var lines = [""];
  (0, _lodash.each)(cells, function (row, row_index) {
    var cell_values = [];
    (0, _lodash.each)(row, function (cell_value, column_index) {
      cell_values.push(cell_value);
    });
    lines.push(cell_values.join(" "));
  });
  lines.push("");
  return lines.join("\n");
};