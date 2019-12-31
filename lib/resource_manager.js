/**
 * No use for native query & restore
 */
const _ = require('lodash');
const Promise = require('bluebird');

const ShareCache = require('./utils/share_cache');
const UndoLog = require('./snapshot/undo_log');
const SnapshotStorage = require('./snapshot/snapshot_storage');

const hooks = { hooks: false };

class DRM {
  static setModels(Models, redisConfig, { durable = true, tccDB = null } = {}) {
    DRM.Models = Models;
    DRM.durable = durable;

    DRM.Storage = SnapshotStorage(durable, tccDB, Models);
    DRM.ShareCache = ShareCache(redisConfig);
    DRM.Undo = UndoLog;
  }

  static getMasterSequelize() {
    return DRM.Models.snapshotLog.sequelize;
  }

  static getSequelizeList() {
    return _.uniq(_.map(DRM.Models, item => item.sequelize));
  }

  static setHooks() {
    const snapshotHooks = require('./snapshot/snapshot_hooks');
    this.getSequelizeList().forEach(snapshotHooks.addHooks);
  }

  static getModel(database, table) {
    if (DRM.Models[table] && DRM.Models[table].sequelize.config.database === database) {
      return DRM.Models[table];
    }

    throw new Error();
  }

  static hasModel(snapshot, branches = []) {
    if (!Array.isArray(branches) || !branches.length) {
      return false;
    }
    const db = snapshot.database,
      table = snapshot.table;

    return branches.some(branch => {
      return branch.sequelize.config.database === db && branch.sequelize.models[table];
    });
  }

  static async rollbackDelete(snapshot, branches) {
    const deletes = snapshot.filter(item => item.sqlType === 'delete' && this.hasModel(item, branches));

    return Promise.map(deletes, async item => {
      const model = this.getModel(item.database, item.table);
      return await model.restore({ where: { id: _.map(item.rows, 'id') } }, hooks);
    });
  }

  static async rollbackUpdate(snapshot, branches) {
    const updates = snapshot.filter(item => item.sqlType === 'update' && this.hasModel(item, branches));

    return Promise.map(updates, async item => {
      const model = this.getModel(item.database, item.table);
      return await model.update({ where: { id: _.map(item.rows, 'id') } }, hooks);
    });
  }

  static async rollbackCreate(snapshot, branches) {
    const creates = snapshot.filter(item => item.sqlType === 'create' && this.hasModel(item, branches));

    return Promise.map(creates, async item => {
      const model = this.getModel(item.database, item.table);
      return await model.destroy({ where: { id: _.map(item.rows, 'id') } }, hooks);
    });
  }

  /**
   * delete > update > create
   * @param {*} requestId
   * @param {*} branches
   */
  static async rollbackFromSnapshot(requestId, branches = []) {
    const snapshot = DRM.Storage.getResource(requestId) || (await DRM.Storage.getSnapshot(requestId)).before;

    if (branches.length && !snapshot) {
      throw Error();
    }

    if (!branches.length && !snapshot) {
      return;
    }

    await this.rollbackDelete(snapshot, branches);
    await this.rollbackUpdate(snapshot, branches);
    await this.rollbackCreate(snapshot, branches);
  }

  static async prepareSnapshotByInsert(instance, options) {
    const transaction = options && options.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    let database, table;
    const resource = { sqlType: 'create', database, table, rows: [] };

    if (Array.isArray(instance)) {
      database = instance[0].sequelize.config.database;
      table = instance[0]._modelOptions.name.singular;
      resource.rows = instance;
    } else {
      database = instance.sequelize.config.database;
      table = instance._modelOptions.name.singular;
      resource.rows = [instance];
    }

    DRM.Storage.setResource(requestId, resource);
  }

  static async prepareSnapshotByDelete(instance, options) {
    const transaction = options && options.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    const database = instance.sequelize.config.database;
    const table = instance._modelOptions.name.singular;

    if (DRM.Storage.hasResource(requestId, instance.id, 'delete', database, table)) {
      return;
    }

    const resource = { sqlType: 'delete', database, table, rows: [instance] };

    DRM.Storage.setResource(requestId, resource);
  }

  static async prepareSnapshotByBulkDelete(instance, options) {
    const transaction = instance && instance.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    const database = transaction.sequelize.config.database;
    const table = instance.model.name;

    const rows = await this.Models[table].findAll({ where: instance.where });
    const resource = { sqlType: 'delete', database, table, rows: [] };
    resource.rows = rows.filter(item => !DRM.Storage.hasResource(requestId, item.id, 'delete', database, table));

    DRM.Storage.setResource(requestId, resource);
  }

  static async prepareSnapshotByUpdate(instance, options) {
    const transaction = options && options.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    const database = instance.sequelize.config.database;
    const table = instance._modelOptions.name.singular;

    if (DRM.Storage.hasResource(requestId, instance.id, 'update', database, table)) {
      return;
    }

    const resource = { sqlType: 'update', database, table, rows: [] };
    const curr = await this.Models[table].findOne({ raw: true, where: { id: instance.id } });

    if (!curr) {
      throw new Error();
    }

    resource.rows = [curr];
    DRM.Storage.setResource(requestId, resource);
  }

  static async prepareSnapshotByBulkUpdate(instance, options) {
    const transaction = instance && instance.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    const database = transaction.sequelize.config.database;
    const table = instance.model.name;

    const where = instance.where[Object.getOwnPropertySymbols(instance.where)[0]][1];
    const rows = await this.Models[table].findAll({ raw: true, where });
    const resource = { sqlType: 'update', database, table, rows: [] };
    resource.rows = rows.filter(item => !DRM.Storage.hasResource(requestId, item.id, 'update', database, table));

    DRM.Storage.setResource(requestId, resource);
  }

  static async prepareSnapshotByUpsert(values, options) {
    const transaction = options && options.transaction;
    const openTcc = transaction && transaction.options.openTcc;
    const requestId = transaction && transaction.options.requestId;

    if (!instance || !openTcc || !requestId) {
      return;
    }

    const database = transaction.sequelize.config.database;
    const table = options.model.name;
    const resource = { sqlType: 'update', database, table, rows: [] };

    const row = await this.Models[table].findOne({ where });
    if (row && !DRM.Storage.hasResource(requestId, item.id, 'update', database, table)) {
      resource.rows = [row];
    }

    DRM.Storage.setResource(requestId, resource);
  }
}

module.exports = {
  DRM,
};
