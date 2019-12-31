const DRM = require('./../resource_manager');

class PrepareSnapshot {
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

    const rows = await DRM.Models[table].findAll({ where: instance.where });
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
    const curr = await DRM.Models[table].findOne({ raw: true, where: { id: instance.id } });

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
    const rows = await DRM.Models[table].findAll({ raw: true, where });
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

    const row = await DRM.Models[table].findOne({ where });
    if (row && !DRM.Storage.hasResource(requestId, item.id, 'update', database, table)) {
      resource.rows = [row];
    }

    DRM.Storage.setResource(requestId, resource);
  }
}

module.exports = PrepareSnapshot;
