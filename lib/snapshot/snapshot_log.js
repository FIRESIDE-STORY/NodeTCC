const Sequelize = require('sequelize');
const TRANSACTION = require('../constants').TRANSACTION;

const STATUSES = Object.values(TRANSACTION.STATUS);
const LEVELS = Object.values(TRANSACTION.ISOLATION_LEVEL);

const PENGDING = TRANSACTION.STATUS.PENGDING;
const REPEATABLE = TRANSACTION.ISOLATION_LEVEL.REPEATABLE;

module.exports = function(sequelize) {
  const SnapshotLog = sequelize.define(
    'snapshotLog',
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      requestId: {
        type: Sequelize.UUID,
        field: 'request_id',
        allowNull: false,
      },
      before: {
        type: Sequelize.JSON,
        field: 'before',
        defaultValue: [{ sqlType: null, database: null, table: null, rows: [] }],
      },
      status: {
        type: Sequelize.STRING(16),
        field: 'status',
        validate: { isIn: { args: [STATUSES], msg: 'Invalid status.' } },
        defaultValue: PENGDING,
      },
      isolationLevel: {
        type: Sequelize.STRING(16),
        field: 'iso_level',
        validate: { isIn: { args: [LEVELS], msg: 'Invalid level.' } },
        defaultValue: REPEATABLE,
      },

      createdAt: { type: Sequelize.DATE, field: 'created_at' },
      updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
      deletedAt: { type: Sequelize.DATE, field: 'deleted_at' },
    },
    {
      paranoid: true,
      underscored: true,
      tableName: 'snapshot_log',
    }
  );

  return SnapshotLog;
};
