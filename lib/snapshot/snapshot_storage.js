const _ = require('lodash');
const tccLog = require('./snapshot_log');
const memoryCache = require('../utils/memory_cache');
const { SUB_DEFAULT } = require('../constants').TRANSACTION.ISOLATION_LEVEL;

const hooks = { hooks: false };

class Snapshot {
  constructor(proxy) {
    this._proxy = proxy;
  }

  async getSnapshot() {
    return this._proxy.getSnapshot(...arguments);
  }

  async saveSnapshot() {
    return this._proxy.saveSnapshot(...arguments);
  }

  async hasSnapshot() {
    return this._proxy.hasSnapshot(...arguments);
  }

  async changeStatus() {
    return this._proxy.changeStatus(...arguments);
  }

  hasResource(requestId, id, sqlType, database, table) {
    const resource = this.getResource(requestId, { checkExist: false });

    if (!resource || !resource.length) {
      return false;
    }

    return resource.some(
      item =>
        item.sqlType === sqlType &&
        item.database === database &&
        item.table === table &&
        item.rows.some(row => row.id === id)
    );
  }

  delResource(requestId) {
    return memoryCache.delCache(requestId);
  }

  getResource(requestId) {
    return memoryCache.getCache(requestId) || [];
  }

  setResource(requestId, resource) {
    if (!resource) {
      throw Error();
    }

    const resources = this.getResource(requestId);
    resources.push(resource);

    memoryCache.setCache(requestId, resources);
  }
}

class HTMSnapshot {
  constructor(tccDB, Models) {
    if (tccDB) {
      Models.snapshotLog = tccLog(tccDB);
    }

    Models.snapshotLog.sync();

    this._cache = memoryCache;
    this._model = Models.snapshotLog;
  }

  async getSnapshot(requestId, { checkExist = true } = {}) {
    const snapshot = await this._model.findOne({ where: { requestId } });

    if (!snapshot && checkExist) {
      throw Error();
    }

    return snapshot;
  }

  async saveSnapshot(requestId, { isolationLevel = SUB_DEFAULT } = {}) {
    const resource = memoryCache.getCache(requestId);
    const params = { requestId, before: resource, isolationLevel };

    return await this._model.create(params, hooks);
  }

  async hasSnapshot(requestId, id, sqlType, database, table) {
    const snapshot = await this.getSnapshot(requestId, { checkExist: false });

    if (!snapshot || !snapshot.before || !snapshot.before.length) {
      return false;
    }

    return snapshot.before.some(
      item =>
        item.sqlType === sqlType &&
        item.database === database &&
        item.table === table &&
        item.rows.some(row => row.id === id)
    );
  }

  async changeStatus(requestId, status) {
    const where = { requestId };
    return await this._model.update({ status }, { where });
  }
}

class LTMSnapshot {}

const selectSnapshotStorage = (durable = true, tccDB, Models) => {
  let proxy;

  if (durable) {
    proxy = new HTMSnapshot(tccDB, Models);
  } else {
    proxy = new LTMSnapshot();
  }

  return new Snapshot(proxy);
};

module.exports = selectSnapshotStorage;
