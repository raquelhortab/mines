'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _configuration = require('./configuration');

var _configuration2 = _interopRequireDefault(_configuration);

var _field = require('./field');

var _field2 = _interopRequireDefault(_field);

var _gameStates = require('../gameStates');

var _gameStates2 = _interopRequireDefault(_gameStates);

var _randomlyPlaceMines = require('./randomlyPlaceMines');

var _randomlyPlaceMines2 = _interopRequireDefault(_randomlyPlaceMines);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (options) {
  var gameStateChangeListeners = [];
  var cellStateChangeListeners = [];
  var remainingMineCountListeners = [];
  var timerChangeListeners = [];
  var config = (0, _configuration2.default)(options);
  var additionalFieldOptions = {
    initialState: options.initialState
  };
  var visibleField = (0, _field2.default)(config.dimensions, config.mine_count, additionalFieldOptions);

  var intervalToken = null;
  var _state = _gameStates2.default.NOT_STARTED;
  var timeStarted = null;
  var elapsedTime = 0;

  var finished = function finished() {
    return _state === _gameStates2.default.WON || _state === _gameStates2.default.LOST;
  };

  var outOfBounds = function outOfBounds(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        row = _ref2[0],
        column = _ref2[1];

    return row < 0 || row > config.dimensions[0] - 1 || column < 0 || column > config.dimensions[1] - 1;
  };

  var appendListener = function appendListener(listeners, cb) {
    listeners.push(cb);
  };
  var notifyListeners = function notifyListeners(listeners, current, previous) {
    return (0, _lodash.map)(listeners, function (cb) {
      cb(current, previous);
    });
  };

  var notifyGameStateChangeListeners = notifyListeners.bind(null, gameStateChangeListeners);
  var notifyRemainingMineCountListeners = notifyListeners.bind(null, remainingMineCountListeners);
  var notifyTimerChangeListeners = notifyListeners.bind(null, timerChangeListeners);

  var reset = function reset() {
    var previousElapsedTime = elapsedTime;
    var previousState = _state;
    var previousRemainingMines = visibleField.remainingMineCount();
    _state = _gameStates2.default.NOT_STARTED;
    timeStarted = null;
    elapsedTime = 0;
    visibleField.reset(cellStateChangeListeners);
    if (intervalToken) {
      global.clearInterval(intervalToken);
      intervalToken = null;
    }
    notifyTimerChangeListeners(elapsedTime, previousElapsedTime);
    notifyGameStateChangeListeners(_state, previousState);
    notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
  };

  var onGameStateChange = appendListener.bind(null, gameStateChangeListeners);
  var onCellStateChange = appendListener.bind(null, cellStateChangeListeners);
  var onRemainingMineCountChange = appendListener.bind(null, remainingMineCountListeners);
  var onTimerChange = appendListener.bind(null, timerChangeListeners);

  var startTimer = function startTimer() {
    if (!timeStarted) {
      timeStarted = new Date().getTime();
    }
    intervalToken = global.setInterval(function () {
      if (_state === _gameStates2.default.STARTED) {
        var previousElapsedTime = elapsedTime;
        var now = new Date().getTime();
        elapsedTime = now - timeStarted;
        notifyTimerChangeListeners(elapsedTime, previousElapsedTime);
      }
    }, 1000);
  };

  var ensureMinesHaveBeenPlaced = function ensureMinesHaveBeenPlaced(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        row = _ref4[0],
        column = _ref4[1];

    if (!visibleField.minesPlaced()) {
      visibleField.placeMines(config.mines || (0, _randomlyPlaceMines2.default)(config, row, column));
      startTimer();
    }
  };

  var changecellStatesWith = function changecellStatesWith(fieldMethod, cell) {
    if (finished() || outOfBounds(cell)) return _state;
    var previous_state = _state;
    ensureMinesHaveBeenPlaced(cell);
    if (fieldMethod(cell, cellStateChangeListeners)) {
      _state = _gameStates2.default.LOST;
    } else {
      _state = visibleField.allCellsWithoutMinesRevealed() ? _gameStates2.default.WON : _gameStates2.default.STARTED;
    }
    notifyGameStateChangeListeners(_state, previous_state);
    return _state;
  };

  var reveal = function reveal(cell) {
    return changecellStatesWith(visibleField.reveal, cell);
  };
  var chord = function chord(cell) {
    return changecellStatesWith(visibleField.chord, cell);
  };

  var mark = function mark(cell) {
    if (finished() || outOfBounds(cell)) return _state;
    var previous_state = _state;
    var previousRemainingMines = visibleField.remainingMineCount();
    visibleField.mark(cell, cellStateChangeListeners);
    notifyGameStateChangeListeners(_state, previous_state);
    notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
    return _state;
  };

  return (0, _lodash.assign)(config, { finished: finished, mark: mark, chord: chord, reveal: reveal, onGameStateChange: onGameStateChange, onCellStateChange: onCellStateChange, onRemainingMineCountChange: onRemainingMineCountChange, onTimerChange: onTimerChange, reset: reset,
    state: function state() {
      return _state;
    },
    cellState: function cellState(cell) {
      return visibleField.cellState(cell);
    },
    remainingMineCount: function remainingMineCount() {
      return visibleField.remainingMineCount();
    },
    renderAsString: function renderAsString() {
      return visibleField.renderAsString();
    },
    started: function started() {
      return timeStarted;
    },
    _visibleField: function _visibleField() {
      return visibleField;
    }
  });
};