module.exports = {
  TRANSACTION: {
    ISOLATION_LEVEL: {
      READ_UNCOMMITTED: 'readUncommitted',
      READ_COMMITTED: 'readCommitted',
      REPEATABLE: 'repeatable',
      SERIALIZABLE: 'serializable',
      TCC_DEFAULT: 'readUncommitted',
      SUB_DEFAULT: 'repeatable',
    },

    STATUS: {
      PENGDING: 'pengding',
      COMMITTED: 'committed',
      ABORTED: 'aborted',
    },

    TIMEOUT: 10000,
    DEBUG: 'NODE_TCC',
  },
};
