/**
 * Prevent data from being modified after commited
 */
const _ = require('lodash');
const redis = require('../utils/share_cache')();
const TRANSACTION = require('../constants').TRANSACTION;

const REPEATABLE = TRANSACTION.ISOLATION_LEVEL.REPEATABLE;
const SERIALIZABLE = TRANSACTION.ISOLATION_LEVEL.SERIALIZABLE;

const READ_UNCOMMITTED = TRANSACTION.ISOLATION_LEVEL.READ_UNCOMMITTED;
const READ_COMMITTED = TRANSACTION.ISOLATION_LEVEL.READ_COMMITTED;

const GREEN_LIGHT = [READ_UNCOMMITTED, READ_COMMITTED];
const RED_LIGHT = [REPEATABLE, SERIALIZABLE];

class UndoLog {
  getKey(database, table, id) {
    if (_.some([database, table, id], item => !_.isString(item))) {
      throw Error();
    }

    return `${database}:${table}:${id}`;
  }

  static async setProcess(database, table, id, value) {
    const key = this.getKey(database, table, id);
    return await redis.setCache(key, value);
  }

  static async msetProcess(database, table, ids, value) {
    const keyValues = ids.map(id => {
      return { [this.getKey(item.database, item.table, item.id)]: item.value };
    });
    return await redis.msetCache(keyValues);
  }

  static async getProcess(database, table, id) {
    const key = this.getKey(database, table, id);
    return await redis.getCache(key);
  }

  static async mgetProcess(database, table, ids) {
    const keys = ids.map(id => this.getKey(database, table, id));
    return await redis.mgetCache(keys);
  }

  static async delProcess(database, table, id) {
    const key = this.getKey(database, table, id);
    return await redis.delCache(key);
  }

  static async isInProcess(database, table, id, { level = READ_UNCOMMITTED } = {}) {
    const process = !Array.isArray(id)
      ? await this.getProcess(database, table, id)
      : await this.mgetProcess(database, table, id);

    switch (level) {
      case READ_UNCOMMITTED:
        return !_.isUndefined(process);
      case READ_COMMITTED:
        return !_.isUndefined(process);
      case REPEATABLE:
        return !_.isUndefined(process);
      case SERIALIZABLE:
        return !_.isUndefined(process);
      default:
        break;
    }
  }
}
module.exports = UndoLog;
