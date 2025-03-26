'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _cellStates = require('../../cellStates');

var _cellStates2 = _interopRequireDefault(_cellStates);

var _cellNeighbours = require('./cellNeighbours');

var _cellNeighbours2 = _interopRequireDefault(_cellNeighbours);

var _renderAsString2 = require('./renderAsString');

var _renderAsString3 = _interopRequireDefault(_renderAsString2);

var _lodash = require('lodash');

var _object = require('lodash/object');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (dimensions, mineCount, opts) {
  var additionalOptions = opts || {};

  var _dimensions = _slicedToArray(dimensions, 2),
      row_count = _dimensions[0],
      column_count = _dimensions[1];

  var _state = additionalOptions.initialState || [];
  var mines = null;
  var totalMines = mineCount || 0;
  var total_cells = row_count * column_count;

  if (!additionalOptions.initialState) {
    (0, _lodash.times)(row_count, function (row_index) {
      var row = [];
      _state.push(row);
      (0, _lodash.times)(column_count, function (column_index) {
        row.push(_cellStates2.default.UNKNOWN);
      });
    });
  }

  var marked = function marked(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        row = _ref2[0],
        column = _ref2[1];

    return _state[row][column] === _cellStates2.default.MARKED;
  };

  var markedOrQuestioned = function markedOrQuestioned(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        row = _ref4[0],
        column = _ref4[1];

    return _state[row][column] === _cellStates2.default.MARKED || _state[row][column] === _cellStates2.default.QUESTION;
  };

  var outOfBounds = function outOfBounds(_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        row = _ref6[0],
        column = _ref6[1];

    return row < 0 || row > row_count - 1 || column < 0 || column > column_count - 1;
  };

  var isMine = function isMine(cell) {
    return (0, _lodash.some)(mines, function (mine) {
      return (0, _lodash.isEqual)(cell, mine);
    });
  };

  var neighbouringMines = function neighbouringMines(neighbours) {
    return (0, _lodash.filter)(neighbours, function (neighbour) {
      return isMine(neighbour);
    });
  };

  var neighbouringMarkedCells = function neighbouringMarkedCells(neighbours) {
    return (0, _lodash.filter)(neighbours, function (neighbour) {
      return marked(neighbour);
    });
  };

  var cellState = function cellState(_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        row = _ref8[0],
        column = _ref8[1];

    return _state[row][column];
  };

  var revealed = function revealed(_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2),
        row = _ref10[0],
        column = _ref10[1];

    return (0, _lodash.some)((0, _lodash.range)(9), function (number) {
      return _state[row][column] === _cellStates2.default[number];
    });
  };

  var notifyListeners = function notifyListeners(listeners, cell, state, previous_state) {
    return (0, _lodash.map)(listeners, function (cb) {
      cb(cell, state, previous_state);
    });
  };

  var reset = function reset(listeners, opts) {
    mines = null;
    console.log('field reset', opts);
    if (opts && opts.mine_count !== undefined) totalMines = opts.mine_count;
    console.log('totalMines', totalMines);
    (0, _lodash.times)(row_count, function (row) {
      (0, _lodash.times)(column_count, function (col) {
        var previousState = _state[row][col];
        _state[row][col] = _cellStates2.default.UNKNOWN;
        notifyListeners(listeners, [row, col], _state[row][col], previousState);
      });
    });
  };

  var setCellState = function setCellState(_ref11, new_state, listeners) {
    var _ref12 = _slicedToArray(_ref11, 2),
        row = _ref12[0],
        column = _ref12[1];

    var previous_state = _state[row][column];
    _state[row][column] = new_state;
    notifyListeners(listeners, [row, column], new_state, previous_state);
  };

  var flagIncorrectlyMarkedMines = function flagIncorrectlyMarkedMines(listeners) {
    (0, _lodash.times)(row_count, function (row) {
      (0, _lodash.times)(column_count, function (column) {
        var cell = [row, column];
        if (cellState(cell) === _cellStates2.default.MARKED && !isMine(cell)) {
          setCellState(cell, _cellStates2.default.INCORRECTLY_MARKED_MINE, listeners);
        }
      });
    });
  };

  var revealUnmarkedMines = function revealUnmarkedMines(listeners) {
    (0, _lodash.map)(mines, function (mine) {
      if (cellState(mine) === _cellStates2.default.UNKNOWN) setCellState(mine, _cellStates2.default.MINE, listeners);
    });
  };

  var finaliseLostGame = function finaliseLostGame(cell, listeners) {
    setCellState(cell, _cellStates2.default.EXPLODED_MINE, listeners);
    revealUnmarkedMines(listeners);
    flagIncorrectlyMarkedMines(listeners);
  };

  var reveal = function reveal(cell, listeners) {
    if (outOfBounds(cell)) return false;
    if (cellState(cell) !== _cellStates2.default.UNKNOWN) return false;
    if (isMine(cell)) {
      finaliseLostGame(cell, listeners);
      return true;
    }
    var neighbours = (0, _cellNeighbours2.default)(dimensions, cell);
    var mine_count = neighbouringMines(neighbours).length;
    var new_state = _cellStates2.default[mine_count];
    setCellState(cell, new_state, listeners);
    if (mine_count === 0) (0, _lodash.map)(neighbours, function (neighbour) {
      reveal(neighbour, listeners);
    });
    return false;
  };

  var chord = function chord(cell, listeners) {
    if (outOfBounds(cell)) return false;
    if (!revealed(cell) && !markedOrQuestioned(cell)) return reveal(cell, listeners);
    if (markedOrQuestioned(cell)) return false;

    var neighbours = (0, _cellNeighbours2.default)(dimensions, cell);
    var revealedMine = false;

    if (revealed(cell) && neighbouringMarkedCells(neighbours).length === neighbouringMines(neighbours).length) {
      (0, _lodash.each)(neighbours, function (neighbour) {
        if (reveal(neighbour, listeners) === true) {
          revealedMine = true;
        }
      });
    }
    return revealedMine;
  };

  var revealedCells = function revealedCells() {
    var count = 0;
    (0, _lodash.times)(row_count, function (row) {
      (0, _lodash.times)(column_count, function (column) {
        if (revealed([row, column])) count += 1;
      });
    });
    return count;
  };

  var markedCellCount = function markedCellCount() {
    var count = 0;
    (0, _lodash.times)(row_count, function (row) {
      (0, _lodash.times)(column_count, function (column) {
        if (marked([row, column])) count += 1;
      });
    });
    return count;
  };

  var remainingMineCount = function remainingMineCount() {
    return totalMines - markedCellCount();
  };

  var getNewMarkedState = function getNewMarkedState(oldState) {
    if (oldState === _cellStates2.default.UNKNOWN) return _cellStates2.default.MARKED;
    if (oldState === _cellStates2.default.MARKED) return _cellStates2.default.QUESTION;
    if (oldState === _cellStates2.default.QUESTION) return _cellStates2.default.UNKNOWN;
    throw new Error('Unknown state of ' + oldState + ' to retrive new marked state');
  };

  var mark = function mark(cell, listeners) {
    var previous_state = cellState(cell);
    if (revealed(cell) || previous_state === _cellStates2.default.UNKNOWN && remainingMineCount() === 0) return previous_state;
    var new_state = getNewMarkedState(previous_state);
    setCellState(cell, new_state, listeners);
    return new_state;
  };

  var publicState = function publicState() {
    var copy = [];
    (0, _lodash.times)(row_count, function (row_index) {
      var row = [];
      copy.push(row);
      (0, _lodash.times)(column_count, function (column_index) {
        row.push(_state[row_index][column_index] === _cellStates2.default.MINE ? _cellStates2.default.UNKNOWN : _state[row_index][column_index]);
      });
    });
    return copy;
  };

  var toggleMine = function toggleMine(_ref13, listeners) {
    var _ref14 = _slicedToArray(_ref13, 2),
        row = _ref14[0],
        column = _ref14[1];

    if (isMine([row, column])) {
      mines = mines.filter(function (coord) {
        return !(0, _lodash.isEqual)([row, column], coord);
      });
      totalMines = mines.length;
      setCellState([row, column], _cellStates2.default.UNKNOWN, listeners);
    } else {
      mines.push([row, column]);
      totalMines = mines.length;
      setCellState([row, column], _cellStates2.default.MINE, listeners);
    }
    return true;
  };

  var setState = function setState(newState) {
    _state = newState;
  };

  // mines is an array of positions [row, col]
  var placeMines = function placeMines(m, updateCount) {
    console.log('m', m);
    if (m.length !== totalMines && !updateCount) {
      console.log('m.length', m.length);
      console.log('totalMines', totalMines);
      throw Error('The number of mines being placed does not match config');
    }
    mines = m;
    if (updateCount) totalMines = mines.length;
  };

  var allCellsWithoutMinesRevealed = function allCellsWithoutMinesRevealed() {
    return revealedCells() === total_cells - totalMines;
  };

  return { placeMines: placeMines, remainingMineCount: remainingMineCount, cellState: cellState, reveal: reveal, mark: mark, chord: chord, revealed: revealed, allCellsWithoutMinesRevealed: allCellsWithoutMinesRevealed, reset: reset, toggleMine: toggleMine, publicState: publicState, setState: setState,
    minesPlaced: function minesPlaced() {
      return !(0, _lodash.isNil)(mines);
    },
    renderAsString: function renderAsString() {
      return (0, _renderAsString3.default)(_state);
    },
    state: function state() {
      return _state;
    },
    getMines: function getMines() {
      return mines;
    }
  };
};