'use strict';

var _create = require('./create');

var _create2 = _interopRequireDefault(_create);

var _cellStates = require('./cellStates');

var _cellStates2 = _interopRequireDefault(_cellStates);

var _gameStates = require('./gameStates');

var _gameStates2 = _interopRequireDefault(_gameStates);

var _toOptions = require('./toOptions');

var _toOptions2 = _interopRequireDefault(_toOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  create: _create2.default,
  cellStates: _cellStates2.default,
  gameStates: _gameStates2.default,
  createTest: function createTest(fieldString) {
    return (0, _create2.default)((0, _toOptions2.default)(fieldString));
  }
};