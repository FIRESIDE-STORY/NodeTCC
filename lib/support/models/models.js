const path = require('path');
const _ = require('lodash');

const { sequelize1 } = require('../sequelize');
const tccLog = require('../../snapshot/snapshot_log');

['firstDemo', 'secondDemo', 'thirdDemo'].map(modelName => {
  exports[modelName] = require(path.join(__dirname, _.snakeCase(modelName)));
});

exports['snapshotLog'] = tccLog(sequelize1);
