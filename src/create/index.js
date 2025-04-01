import configuration from './configuration';
import field from './field';
import gameStates from '../gameStates';
import randomlyPlaceMines from './randomlyPlaceMines';
import {assign, map} from 'lodash';
import { createDecipheriv, createCipheriv } from 'crypto';
import { Buffer } from 'buffer';
import GameStates from "../gameStates";

export default (options) => {
  const gameStateChangeListeners = [];
  const cellStateChangeListeners = [];
  const remainingMineCountListeners = [];
  const timerChangeListeners = [];
  const config = configuration(options);
  console.log('create config options', options);
  console.log('create config editable', config.editable);
  console.log('create config mine_count', config.mine_count);
  const additionalFieldOptions = {
    initialState: options.initialState
  };
  const visibleField = field(config.dimensions, config.mine_count, additionalFieldOptions);

  let intervalToken = null;
  let state = gameStates.NOT_STARTED;
  let timeStarted = null;
  let elapsedTime = 0;

  const finished = () => (state === gameStates.WON || state === gameStates.LOST);

  const outOfBounds = ([row, column]) => {
    return (row < 0 || row > (config.dimensions[0] - 1) || column < 0 || column > (config.dimensions[1] - 1));
  };

  const appendListener = (listeners, cb) => { listeners.push(cb); };
  const notifyListeners = (listeners, current, previous) => map(listeners, (cb) => { cb(current, previous); });

  const notifyGameStateChangeListeners = notifyListeners.bind(null, gameStateChangeListeners);
  const notifyRemainingMineCountListeners = notifyListeners.bind(null, remainingMineCountListeners);
  const notifyTimerChangeListeners = notifyListeners.bind(null, timerChangeListeners);

  const decrypt = (encryptedData) => {

    const key = Buffer.from("1234567890abcdef1234567890abcdef"); // 32-byte key
    const iv = Buffer.from("abcdef1234567890"); // 16-byte IV

    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  };

  const encrypt = (data) => {
    const key = Buffer.from("1234567890abcdef1234567890abcdef"); // 32-byte key
    const iv = Buffer.from("abcdef1234567890"); // 16-byte IV

    const cipher = createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf-8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted.toString("base64"); // Base64 encode for safe transfer
  };

  const loadFieldData = (_data, encrypted) => {
    const data = encrypted ? JSON.parse(decrypt(_data)) : _data;
    const previous_state = state;
    const previousRemainingMines = visibleField.remainingMineCount();
    if (data.state) {
      visibleField.setState(data.state, cellStateChangeListeners);
    }
    if (data.mines) {
      visibleField.placeMines(data.mines, {updateCount: true, showMines: !encrypted, listeners: cellStateChangeListeners});
      config.mine_count = data.mines.length;
    }
    state = GameStates.STARTED;
    startTimer();
    notifyTimerChangeListeners(0, 0);
    notifyGameStateChangeListeners(state, previous_state);
    notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
  };

  const getFieldData = () => {
    return {
      mines: visibleField.getMines(),
      state: visibleField.publicState()
    };
  };

  const reset = () => {
    const previousElapsedTime = elapsedTime;
    const previousState = state;
    const previousRemainingMines = visibleField.remainingMineCount();
    state = gameStates.NOT_STARTED;
    timeStarted = null;
    elapsedTime = 0;
    const opts = config.editable ? {mine_count: 0} : {};
    visibleField.reset(cellStateChangeListeners, opts);
    if (intervalToken) {
      global.clearInterval(intervalToken);
      intervalToken = null;
    }
    notifyTimerChangeListeners(elapsedTime, previousElapsedTime);
    notifyGameStateChangeListeners(state, previousState);
    notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
  };

  const onGameStateChange = appendListener.bind(null, gameStateChangeListeners);
  const onCellStateChange = appendListener.bind(null, cellStateChangeListeners);
  const onRemainingMineCountChange = appendListener.bind(null, remainingMineCountListeners);
  const onTimerChange = appendListener.bind(null, timerChangeListeners);

  const startTimer = () => {
    if (!timeStarted) { timeStarted = new Date().getTime(); }
    intervalToken = global.setInterval(() => {
      if (state === gameStates.STARTED) {
        const previousElapsedTime = elapsedTime;
        const now = new Date().getTime();
        elapsedTime = now - timeStarted;
        notifyTimerChangeListeners(elapsedTime, previousElapsedTime);
      }
    }, 1000);
  };

  const ensureMinesHaveBeenPlaced = ([row, column]) => {
    if (!visibleField.minesPlaced()) {
      visibleField.placeMines(config.mines || randomlyPlaceMines(config, row, column));
      startTimer();
    } else {
    }
  };

  const changecellStatesWith = (fieldMethod, cell) => {
    if (finished() || outOfBounds(cell)) return state;
    const previous_state = state;
    ensureMinesHaveBeenPlaced(cell);
    if (fieldMethod(cell, cellStateChangeListeners)) {
      state = gameStates.LOST;
    } else {
      state = visibleField.allCellsWithoutMinesRevealed() ? gameStates.WON : gameStates.STARTED;
    }
    notifyGameStateChangeListeners(state, previous_state);
    return state;
  };

  const reveal = (cell) => changecellStatesWith(visibleField.reveal, cell);
  const chord = (cell) => changecellStatesWith(visibleField.chord, cell);

  const mark = (cell) => {
    if (finished() || outOfBounds(cell)) return state;
    const previous_state = state;
    const previousRemainingMines = visibleField.remainingMineCount();
    visibleField.mark(cell, cellStateChangeListeners);
    notifyGameStateChangeListeners(state, previous_state);
    notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
    return state;
  };

  const toggleMine = (cell) => {
    if (!config.editable) return false;
    if (finished() || outOfBounds(cell)) return false;
    ensureMinesHaveBeenPlaced(cell);
    const previous_state = state;
    const previousRemainingMines = visibleField.remainingMineCount();
    if (visibleField.toggleMine(cell, cellStateChangeListeners)) {
      notifyGameStateChangeListeners(state, previous_state);
      notifyRemainingMineCountListeners(visibleField.remainingMineCount(), previousRemainingMines);
      return true;
    }
    return false;
  };

  return assign(config, {finished, mark, chord, reveal, onGameStateChange, onCellStateChange, onRemainingMineCountChange, onTimerChange,
    reset, toggleMine, loadFieldData, getFieldData, encrypt,
    state: () => state,
    cellState: (cell) => visibleField.cellState(cell),
    remainingMineCount: () => visibleField.remainingMineCount(),
    renderAsString: () => visibleField.renderAsString(),
    started: () => timeStarted,
    editable: () => config.editable,
    visibleField: () => visibleField
  });
};
