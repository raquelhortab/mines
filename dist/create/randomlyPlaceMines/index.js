'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

exports.default = function (configuration, row, column) {
  var shuffleMethod = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _lodash.shuffle;

  var _configuration$dimens = _slicedToArray(configuration.dimensions, 2),
      row_count = _configuration$dimens[0],
      column_count = _configuration$dimens[1];

  var cells = [];

  (0, _lodash.times)(row_count, function (row_index) {
    (0, _lodash.times)(column_count, function (column_index) {
      if (!(0, _lodash.isEqual)([row, column], [row_index, column_index])) {
        cells.push([row_index, column_index]);
      }
    });
  });

  return (0, _lodash.take)(shuffleMethod(cells), configuration.mine_count);
};