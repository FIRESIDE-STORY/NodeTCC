const { DRM } = require('../resource_manager');

const queryInterceptor = async () => {};

const setResource = async (sqlType, instance, options) => {
  switch (sqlType) {
    case 'create':
    case 'bulkCreate':
      await DRM.prepareSnapshotByInsert(instance, options);
      break;
    case 'destroy':
      await DRM.prepareSnapshotByDelete(instance, options);
      break;
    case 'bulkDestroy':
      await DRM.prepareSnapshotByBulkDelete(instance, options);
      break;
    case 'update':
      await DRM.prepareSnapshotByUpdate(instance, options);
      break;
    case 'bulkUpdate':
      await DRM.prepareSnapshotByBulkUpdate(instance, options);
      break;
    default:
      throw new Error();
  }
};

/**
 * just for SERIALIZABLE,
 * @param {*} sqlType
 * @param {*} instance
 * @param {*} options
 */
const checkResource = async (sqlType, instance, options) => {
  switch (sqlType) {
    case 'find':
    case 'query':
    case 'create':
    case 'bulkCreate':
    case 'destroy':
    case 'bulkDestroy':
    case 'update':
    case 'bulkUpdate':
      break;
    default:
      break;
  }
};

const afterCreate = async (instance, options) => setResource('create', instance, options);
const beforeUpdate = async (instance, options) => setResource('update', instance, options);
const beforeDestroy = async (instance, options) => setResource('destroy', instance, options);

const beforeBulkCreate = async (instances, options) => setResource('bulkCreate', instances, options);
const beforeBulkUpdate = async (instances, options) => setResource('bulkUpdate', instances, options);
const beforeBulkDestroy = async (instances, options) => setResource('bulkDestroy', instances, options);

const beforeUpsert = async (instances, options) => setResource('upsert', instances, options);
const beforeQuery = async (instances, options) => setResource('query', instances, options);
const afterQuery = async (instances, options) => setResource('query', instances, options);

const beforeFind = async (instances, options) => checkResource('find', instances, options);

/**
 * instance
 *
 * bulkCreate = create
 * create = update + save
 * save = update + save
 * update = update + save
 * destroy = destroy
 *
 * @param {*} sequelize
 *
 */

const addHooks = sequelize => {
  sequelize.addHook('afterCreate', afterCreate);
  sequelize.addHook('beforeUpdate', beforeUpdate);
  sequelize.addHook('beforeDestroy', beforeDestroy);
  sequelize.addHook('beforeBulkCreate', beforeBulkCreate);
  sequelize.addHook('beforeBulkUpdate', beforeBulkUpdate);
  sequelize.addHook('beforeBulkDestroy', beforeBulkDestroy);
};

module.exports = {
  setResource,
  afterCreate,
  beforeUpdate,
  beforeDestroy,
  beforeBulkCreate,
  beforeBulkUpdate,
  beforeBulkDestroy,
  addHooks,
};
