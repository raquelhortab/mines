'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var presets = {
  beginner: {
    dimensions: [9, 9],
    mine_count: 10
  },
  intermediate: {
    dimensions: [16, 16],
    mine_count: 40
  },
  expert: {
    dimensions: [16, 30],
    mine_count: 99
  }
};

var validate_dimensions = function validate_dimensions(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      row_count = _ref2[0],
      column_count = _ref2[1];

  if (row_count < 1) throw new Error('must have at least 1 row');
  if (column_count < 1) throw new Error('must have at least 1 column');
};

var validate_mine_count = function validate_mine_count(_ref3, mine_count) {
  var _ref4 = _slicedToArray(_ref3, 2),
      row_count = _ref4[0],
      column_count = _ref4[1];

  if (mine_count < 1) throw new Error('must have at least 1 mine');
  if (mine_count >= row_count * column_count) throw new Error('must place fewer mines than the number of available cells');
};

var determine_mine_count = function determine_mine_count(mines, mine_count) {
  return (0, _lodash.isNil)(mines) ? mine_count : mines.length;
};

var configuration = function configuration(options) {
  var specifiedOrEmptyOptions = options || { preset: 'expert' };
  var mines = specifiedOrEmptyOptions.mines;
  var preset = presets[specifiedOrEmptyOptions.preset];
  var result = {};

  result.editable = Boolean(options.editable);

  if (preset) {
    result.dimensions = preset.dimensions;
    result.mine_count = preset.mine_count;
  } else {
    result.mine_count = specifiedOrEmptyOptions.mine_count;
    result.dimensions = specifiedOrEmptyOptions.dimensions;
    validate_dimensions(result.dimensions);
  }

  console.log('specifiedOrEmptyOptions', specifiedOrEmptyOptions.mine_count);
  result.mine_count = specifiedOrEmptyOptions.mine_count === undefined ? result.mine_count || 0 : specifiedOrEmptyOptions.mine_count;
  result.mine_count = determine_mine_count(mines, result.mine_count) || 0;
  // if (!result.editable) validate_mine_count(result.dimensions, result.mine_count);

  if (!(0, _lodash.isNil)(mines)) {
    result.test_mode = true;
    result.mines = mines;
  }

  result.modern = options.modern;

  return result;
};

exports.default = configuration;