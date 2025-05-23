import {isNil} from 'lodash';

const presets = {
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

const validate_dimensions = ([row_count, column_count]) => {
  if (row_count < 1) throw new Error(`must have at least 1 row`);
  if (column_count < 1) throw new Error(`must have at least 1 column`);
};

const validate_mine_count = ([row_count, column_count], mine_count) => {
  if (mine_count < 1) throw new Error(`must have at least 1 mine`);
  if (mine_count >= (row_count * column_count)) throw new Error(`must place fewer mines than the number of available cells`);
};

const determine_mine_count = (mines, mine_count) => (
  isNil(mines) ? mine_count : mines.length
);

const configuration = (options) => {
  const specifiedOrEmptyOptions = options || { preset: 'expert' };
  const mines = specifiedOrEmptyOptions.mines;
  const preset = presets[specifiedOrEmptyOptions.preset];
  const result = {};

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
  result.mine_count = specifiedOrEmptyOptions.mine_count === undefined ? (result.mine_count || 0) : specifiedOrEmptyOptions.mine_count;
  result.mine_count = determine_mine_count(mines, result.mine_count) || 0;
  // if (!result.editable) validate_mine_count(result.dimensions, result.mine_count);

  if (!isNil(mines)) {
    result.test_mode = true;
    result.mines = mines;
  }

  result.modern = options.modern;

  return result;
};

export default configuration;
