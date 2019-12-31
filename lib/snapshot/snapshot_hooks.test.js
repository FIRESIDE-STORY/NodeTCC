const uuid = require('uuid/v1');
const Models = require('../support/models');
const { DRM } = require('../resource_manager');

const mockFn = {
  afterCreate: () => {},
  beforeUpdate: () => {},
  beforeDestroy: () => {},
  beforeBulkCreate: () => {},
  beforeBulkUpdate: () => {},
  beforeBulkDestroy: () => {},
};

const mockAddHooksSpy = sequelize => {
  sequelize.addHook('afterCreate', mockFn.afterCreate);
  sequelize.addHook('beforeUpdate', mockFn.beforeUpdate);
  sequelize.addHook('beforeDestroy', mockFn.beforeDestroy);
  sequelize.addHook('beforeBulkCreate', mockFn.beforeBulkCreate);
  sequelize.addHook('beforeBulkUpdate', mockFn.beforeBulkUpdate);
  sequelize.addHook('beforeBulkDestroy', mockFn.beforeBulkDestroy);
};

describe('snapshotHooks', () => {
  jest.doMock('./snapshot_hooks.js');
  const snapshotHooks = require('./snapshot_hooks');
  snapshotHooks.addHooks.mockResolvedValue(mockAddHooksSpy);

  test('afterCreate', async () => {
    jest.spyOn(mockFn, 'afterCreate');
    snapshotHooks.afterCreate.mockResolvedValue(mockFn.afterCreate());

    await Models.firstDemo.create({ id: uuid() });
    expect(mockFn.afterCreate).toHaveBeenCalled();
  });

  test('beforeUpdate', async () => {
    jest.spyOn(mockFn, 'beforeUpdate');
    snapshotHooks.beforeUpdate.mockResolvedValue(mockFn.beforeUpdate());

    await Models.firstDemo.create({ id: uuid() });
    expect(mockFn.beforeUpdate).toHaveBeenCalled();
  });

  test('beforeDestroy', async () => {
    jest.spyOn(mockFn, 'beforeDestroy');
    snapshotHooks.beforeDestroy.mockResolvedValue(mockFn.beforeDestroy());

    await Models.firstDemo.create({ requestId: uuid() });
    expect(mockFn.beforeDestroy).toHaveBeenCalled();
  });

  test('afterCreate', async () => {
    jest.spyOn(mockFn, 'beforeBulkCreate');
    snapshotHooks.beforeBulkCreate.mockResolvedValue(mockFn.beforeBulkCreate());

    await Models.firstDemo.create({ requestId: uuid() });
    expect(mockFn.beforeBulkCreate).toHaveBeenCalled();
  });

  test('beforeBulkUpdate', async () => {
    jest.spyOn(mockFn, 'beforeBulkUpdate');
    snapshotHooks.afterCreate.mockResolvedValue(mockFn.beforeBulkUpdate());

    await Models.firstDemo.create({ id: uuid() });
    expect(mockFn.beforeBulkUpdate).toHaveBeenCalled();
  });

  test('beforeBulkDestroy', async () => {
    jest.spyOn(mockFn, 'beforeBulkDestroy');
    snapshotHooks.beforeBulkDestroy.mockResolvedValue(mockFn.beforeBulkDestroy());

    await Models.firstDemo.create({ id: uuid() });
    expect(mockFn.beforeBulkDestroy).toHaveBeenCalled();
  });

  describe('setResource', () => {
    test('options', async () => {
      const spy = jest.spyOn(DRM, 'prepareSnapshotByInsert');
      const instance = Models.firstDemo.create({ id: uuid() });
      await snapshotHooks.setResource('create', instance, { demo: 123 });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
