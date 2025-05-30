import cellStates from '../../cellStates';
import cellNeighbours from './cellNeighbours';
import renderAsString from './renderAsString';
import {times, isNil, isEqual, filter, some, map, range, each} from 'lodash';
import CellStates from "../../cellStates";
import {update} from "lodash/object";

export default (dimensions, mineCount, opts) => {
  let additionalOptions = opts || {};
  const [row_count, column_count] = dimensions;
  let state = additionalOptions.initialState || [];
  let mines = null;
  let totalMines = mineCount || 0;
  const total_cells = row_count * column_count;

  const updateState = () => {
    times(row_count, (row_index) => {
      const row = [];
      state.push(row);
      times(column_count, (column_index) => {
        row.push(cellStates.UNKNOWN);
      });
    });
  };

  const marked = ([row, column]) => {
    return state[row][column] === cellStates.MARKED;
  };

  const markedOrQuestioned = ([row, column]) => {
    return state[row][column] === cellStates.MARKED || state[row][column] === cellStates.QUESTION;
  };

  const outOfBounds = ([row, column]) => {
    return (row < 0 || row > (row_count - 1) || column < 0 || column > (column_count - 1));
  };

  const isMine = (cell) => {
    return some(mines, (mine) => isEqual(cell, mine));
  };

  const neighbouringMines = (neighbours) => filter(neighbours, (neighbour) => isMine(neighbour));

  const neighbouringMarkedCells = (neighbours) => filter(neighbours, (neighbour) => marked(neighbour));

  const cellState = ([row, column]) => state[row][column];

  const revealed = ([row, column]) => some(range(9), (number) => state[row][column] === cellStates[number]);

  const notifyListeners = (listeners, cell, state, previous_state) => map(listeners, (cb) => { if (cb) { return cb(cell, state, previous_state); } });

  const reset = (listeners, opts) => {
    mines = null;
    if (opts && opts.mine_count !== undefined) totalMines = opts.mine_count;
    times(row_count, (row) => {
      times(column_count, (col) => {
        const previousState = state[row][col];
        state[row][col] = cellStates.UNKNOWN;
        notifyListeners(listeners, [row, col], state[row][col], previousState);
      });
    });
  };

  const setCellState = ([row, column], new_state, listeners) => {
    const previous_state = state[row][column];
    state[row][column] = new_state;
    notifyListeners(listeners, [row, column], new_state, previous_state);
  };

  const flagIncorrectlyMarkedMines = (listeners) => {
    times(row_count, (row) => {
      times(column_count, (column) => {
        const cell = [row, column];
        if (cellState(cell) === cellStates.MARKED && !isMine(cell)) {
          setCellState(cell, cellStates.INCORRECTLY_MARKED_MINE, listeners);
        }
      });
    });
  };

  const revealUnmarkedMines = (listeners) => {
    map(mines, (mine) => {
      if (cellState(mine) === cellStates.UNKNOWN) setCellState(mine, cellStates.MINE, listeners);
    });
  };

  const finaliseLostGame = (cell, listeners) => {
    setCellState(cell, cellStates.EXPLODED_MINE, listeners);
    revealUnmarkedMines(listeners);
    flagIncorrectlyMarkedMines(listeners);
  };

  const reveal = (cell, listeners) => {
    if (outOfBounds(cell)) return false;
    if (cellState(cell) !== cellStates.UNKNOWN) return false;
    if (isMine(cell)) {
      finaliseLostGame(cell, listeners);
      return true;
    }
    const neighbours = cellNeighbours(dimensions, cell);
    const mine_count = neighbouringMines(neighbours).length;
    const new_state = cellStates[mine_count];
    setCellState(cell, new_state, listeners);
    if (mine_count === 0) map(neighbours, (neighbour) => { reveal(neighbour, listeners); });
    return false;
  };

  const chord = (cell, listeners) => {
    if (outOfBounds(cell)) return false;
    if (!revealed(cell) && !(markedOrQuestioned(cell))) return reveal(cell, listeners);
    if (markedOrQuestioned(cell)) return false;

    const neighbours = cellNeighbours(dimensions, cell);
    let revealedMine = false;

    if (revealed(cell) && neighbouringMarkedCells(neighbours).length === neighbouringMines(neighbours).length) {
      each(neighbours, (neighbour) => {
        if (reveal(neighbour, listeners) === true) { revealedMine = true; }
      });
    }
    return revealedMine;
  };

  const revealedCells = () => {
    let count = 0;
    times(row_count, (row) => {
      times(column_count, (column) => {
        if (revealed([row, column])) count += 1;
      });
    });
    return count;
  };

  const markedCellCount = () => {
    let count = 0;
    times(row_count, (row) => {
      times(column_count, (column) => {
        if (marked([row, column])) count += 1;
      });
    });
    return count;
  };

  const remainingMineCount = () => {
    return totalMines - markedCellCount();
  };

  const getNewMarkedState = (oldState) => {
    if (oldState === cellStates.UNKNOWN) return cellStates.MARKED;
    if (oldState === cellStates.MARKED) return cellStates.QUESTION;
    if (oldState === cellStates.QUESTION) return cellStates.UNKNOWN;
    throw new Error(`Unknown state of ${oldState} to retrive new marked state`);
  };

  const mark = (cell, listeners) => {
    const previous_state = cellState(cell);
    if (revealed(cell) || (previous_state === cellStates.UNKNOWN && remainingMineCount() === 0)) return previous_state;
    const new_state = getNewMarkedState(previous_state);
    setCellState(cell, new_state, listeners);
    return new_state;
  };

  const publicState = () => {
    let copy = [];
    times(row_count, (row_index) => {
      const row = [];
      copy.push(row);
      times(column_count, (column_index) => {
        row.push(state[row_index][column_index] === cellStates.MINE ? cellStates.UNKNOWN : state[row_index][column_index]);
      });
    });
    return copy;
  };

  const toggleMine = ([row, column], listeners) => {
    if (isMine([row, column])) {
      mines = mines.filter((coord) => !isEqual([row, column], coord));
      totalMines = mines.length;
      setCellState([row, column], CellStates.UNKNOWN, listeners);
    } else {
      mines.push([row, column]);
      totalMines = mines.length;
      setCellState([row, column], CellStates.MINE, listeners);
    }
    return true;
  };

  const setState = (newState, listeners) => {
    times(row_count, (row_index) => {
      times(column_count, (column_index) => {
        setCellState([row_index, column_index], newState[row_index][column_index], listeners);
      });
    });
  };

  // mines is an array of positions [row, col]
  const placeMines = (m, opts) => {
    let options = opts || {};
    const updateCount = options.updateCount || false;
    const showMines = options.showMines || false;
    if (m.length !== totalMines && !updateCount) {
      throw Error('The number of mines being placed does not match config');
    }
    mines = m;
    if (updateCount) totalMines = mines.length;
    if (showMines) {
      mines.forEach((m) => {
        setCellState(m, cellStates.MINE, opts.listeners);
      });
    }
  };

  const allCellsWithoutMinesRevealed = () => revealedCells() === (total_cells - totalMines);

  if (!additionalOptions.initialState) {
    updateState();
  }

  return { placeMines, remainingMineCount, cellState, reveal, mark, chord, revealed, allCellsWithoutMinesRevealed, reset, toggleMine, publicState, setState,
    minesPlaced: () => !isNil(mines),
    renderAsString: () => renderAsString(state),
    state: () => state,
    getMines: () => mines
  };
};
