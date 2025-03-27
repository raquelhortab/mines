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

var _crypto = require('crypto');

var _buffer = require('buffer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (options) {
  var gameStateChangeListeners = [];
  var cellStateChangeListeners = [];
  var remainingMineCountListeners = [];
  var timerChangeListeners = [];
  var config = (0, _configuration2.default)(options);
  console.log('create config options', options);
  console.log('create config editable', config.editable);
  console.log('create config mine_count', config.mine_count);
  var additionalFieldOptions = {
    initialState: options.initialState
  };
  var _visibleField = (0, _field2.default)(config.dimensions, config.mine_count, additionalFieldOptions);

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

  var decrypt = function decrypt(encryptedData) {

    var key = _buffer.Buffer.from("1234567890abcdef1234567890abcdef"); // 32-byte key
    var iv = _buffer.Buffer.from("abcdef1234567890"); // 16-byte IV

    var encryptedBuffer = _buffer.Buffer.from(encryptedData, 'base64');

    var decipher = (0, _crypto.createDecipheriv)("aes-256-cbc", key, iv);
    var decrypted = decipher.update(encryptedBuffer);
    decrypted = _buffer.Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  };

  var loadFieldData = function loadFieldData(_data, encrypted) {
    var data = encrypted ? JSON.parse(decrypt(_data)) : _data;
    var previous_state = _state;
    var previousRemainingMines = _visibleField.remainingMineCount();
    console.log('loadFieldData', data);
    if (data.state) {
      _visibleField.setState(data.state, cellStateChangeListeners);
    }
    if (data.mines) {
      _visibleField.placeMines(data.mines, { updateCount: true, showMines: !encrypted, listeners: cellStateChangeListeners });
    }
    notifyGameStateChangeListeners(_state, previous_state);
    notifyRemainingMineCountListeners(_visibleField.remainingMineCount(), previousRemainingMines);
  };

  var getFieldData = function getFieldData(data) {
    return {
      mines: _visibleField.getMines(),
      state: _visibleField.publicState()
    };
  };

  var reset = function reset() {
    var previousElapsedTime = elapsedTime;
    var previousState = _state;
    var previousRemainingMines = _visibleField.remainingMineCount();
    _state = _gameStates2.default.NOT_STARTED;
    timeStarted = null;
    elapsedTime = 0;
    var opts = config.editable ? { mine_count: 0 } : {};
    _visibleField.reset(cellStateChangeListeners, opts);
    if (intervalToken) {
      global.clearInterval(intervalToken);
      intervalToken = null;
    }
    notifyTimerChangeListeners(elapsedTime, previousElapsedTime);
    notifyGameStateChangeListeners(_state, previousState);
    notifyRemainingMineCountListeners(_visibleField.remainingMineCount(), previousRemainingMines);
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

    if (!_visibleField.minesPlaced()) {
      _visibleField.placeMines(config.mines || (0, _randomlyPlaceMines2.default)(config, row, column));
      startTimer();
    } else {}
  };

  var changecellStatesWith = function changecellStatesWith(fieldMethod, cell) {
    if (finished() || outOfBounds(cell)) return _state;
    var previous_state = _state;
    ensureMinesHaveBeenPlaced(cell);
    if (fieldMethod(cell, cellStateChangeListeners)) {
      _state = _gameStates2.default.LOST;
    } else {
      _state = _visibleField.allCellsWithoutMinesRevealed() ? _gameStates2.default.WON : _gameStates2.default.STARTED;
    }
    notifyGameStateChangeListeners(_state, previous_state);
    return _state;
  };

  var reveal = function reveal(cell) {
    return changecellStatesWith(_visibleField.reveal, cell);
  };
  var chord = function chord(cell) {
    return changecellStatesWith(_visibleField.chord, cell);
  };

  var mark = function mark(cell) {
    if (finished() || outOfBounds(cell)) return _state;
    var previous_state = _state;
    var previousRemainingMines = _visibleField.remainingMineCount();
    _visibleField.mark(cell, cellStateChangeListeners);
    notifyGameStateChangeListeners(_state, previous_state);
    notifyRemainingMineCountListeners(_visibleField.remainingMineCount(), previousRemainingMines);
    return _state;
  };

  var toggleMine = function toggleMine(cell) {
    if (!config.editable) return false;
    if (finished() || outOfBounds(cell)) return false;
    ensureMinesHaveBeenPlaced(cell);
    var previous_state = _state;
    var previousRemainingMines = _visibleField.remainingMineCount();
    if (_visibleField.toggleMine(cell, cellStateChangeListeners)) {
      notifyGameStateChangeListeners(_state, previous_state);
      notifyRemainingMineCountListeners(_visibleField.remainingMineCount(), previousRemainingMines);
      return true;
    }
    return false;
  };

  return (0, _lodash.assign)(config, { finished: finished, mark: mark, chord: chord, reveal: reveal, onGameStateChange: onGameStateChange, onCellStateChange: onCellStateChange, onRemainingMineCountChange: onRemainingMineCountChange, onTimerChange: onTimerChange, reset: reset, toggleMine: toggleMine, loadFieldData: loadFieldData, getFieldData: getFieldData,
    state: function state() {
      return _state;
    },
    cellState: function cellState(cell) {
      return _visibleField.cellState(cell);
    },
    remainingMineCount: function remainingMineCount() {
      return _visibleField.remainingMineCount();
    },
    renderAsString: function renderAsString() {
      return _visibleField.renderAsString();
    },
    started: function started() {
      return timeStarted;
    },
    editable: function editable() {
      return config.editable;
    },
    visibleField: function visibleField() {
      return _visibleField;
    }
  });
};