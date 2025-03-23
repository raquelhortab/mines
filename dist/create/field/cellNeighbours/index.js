'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var offsets = [-1, 0, 1];

var withinBound = function withinBound(val, max) {
  return val >= 0 && val < max;
};

var withinBounds = function withinBounds(row_count, column_count, row, column) {
  return withinBound(row, row_count) && withinBound(column, column_count);
};

exports.default = function (_ref, _ref2) {
  var _ref4 = _slicedToArray(_ref, 2),
      row_count = _ref4[0],
      column_count = _ref4[1];

  var _ref3 = _slicedToArray(_ref2, 2),
      row = _ref3[0],
      column = _ref3[1];

  var cells = [];

  (0, _lodash.each)(offsets, function (row_offset) {
    var row_index = row + row_offset;
    (0, _lodash.each)(offsets, function (column_offset) {
      var column_index = column + column_offset;
      var this_cell = (0, _lodash.isEqual)([row, column], [row_index, column_index]);
      if (!this_cell && withinBounds(row_count, column_count, row_index, column_index)) {
        cells.push([row_index, column_index]);
      }
    });
  });

  return cells;
};