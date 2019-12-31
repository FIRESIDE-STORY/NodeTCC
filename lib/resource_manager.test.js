const uuid = require('uuid/v1');
const Models = require('./support/models');
const { DRM } = require('./resource_manager');

DRM.setModels(Models);

describe('resource_manager', () => {
  test('Models', () => {
    expect(DRM.Models).toBe(Models);
  });

  test('setResource/getResource', () => {
    const key = uuid();

    DRM.Storage.setResource(key, 1);
    DRM.Storage.setResource(key, 2);
    DRM.Storage.setResource(key, 3);

    const data = DRM.Storage.getResource(key);

    expect(data.length).toBe(3);
    expect(data[0]).toBe(1);
    expect(data[1]).toBe(2);
    expect(data[2]).toBe(3);
    expect(DRM.Storage.getResource(key)).toBe(data);
  });

  test('setHooks', () => {
    DRM.setHooks();
  });

  test('getModel', () => {
    const model = DRM.getModel('node_tcc1', 'firstDemo');
    expect(model).not.toBe(null);
  });

  test('getMasterSequelize', () => {
    const masterSequelize = DRM.getMasterSequelize();
    expect(masterSequelize.models.snapshotLog).not.toBe(null);
  });

  test('getSequelizeList', () => {
    const sequelizeList = DRM.getSequelizeList();
    expect(sequelizeList.length).toBe(3);
  });

  test('saveSnapshot/changeStatus', async () => {
    const requestId = uuid();

    const before = {
      sqlType: 'update',
      database: 'node_tcc1',
      table: 'firstDemo',
      rows: [{ amount: 2 }],
    };

    DRM.Storage.setResource(requestId, before);

    const snapshot = await DRM.Storage.saveSnapshot(requestId);

    expect(snapshot).not.toBe(null);
    expect(snapshot.requestId).toBe(requestId);
    expect(snapshot.status).toBe('pengding');
    expect(snapshot.before[0].sqlType).toBe(before.sqlType);
    expect(snapshot.before[0].database).toBe(before.database);
    expect(snapshot.before[0].rows.length).toBe(before.rows.length);
    expect(snapshot.before[0].table).toBe(before.table);

    const update1 = await DRM.Storage.changeStatus(requestId, 'committed');
    expect(update1.length).toBe(1);

    const update2 = await DRM.Storage.changeStatus(requestId, 'aborted');
    expect(update2.length).toBe(1);

    const update3 = await DRM.Storage.changeStatus(requestId, 'pengding');
    expect(update3.length).toBe(1);
  });

  describe('prepareSnapshotByInsert', () => {
    test('openTcc = false', async () => {
      const options = { requestId: uuid(), openTcc: false };
      const instance = await Models.firstDemo.create({ id: options.requestId }, { hooks: false });

      const spy = jest.spyOn(DRM.Storage, 'setResource');
      await DRM.prepareSnapshotByInsert(instance, { transaction: { options } });
      expect(spy).not.toHaveBeenCalled();
    });

    test('no requestId', async () => {
      const options = { openTcc: true };
      const instance = await Models.firstDemo.create({ id: uuid() }, { hooks: false });

      const spy = jest.spyOn(DRM.Storage, 'setResource');
      await DRM.prepareSnapshotByInsert(instance, { transaction: { options } });
      expect(spy).not.toHaveBeenCalled();
    });

    test('success', async () => {
      const options = { requestId: uuid(), openTcc: true };
      const instance = await Models.firstDemo.create({ id: options.requestId }, { hooks: false });

      const spy = jest.spyOn(DRM.Storage, 'setResource');
      await DRM.prepareSnapshotByInsert(instance, { transaction: { options } });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('prepareSnapshotByDelete', () => {
    test('success', async () => {
      const options = { requestId: uuid(), openTcc: true };
      const instance = await Models.firstDemo.create({ id: options.requestId }, { hooks: false });

      const spy = jest.spyOn(DRM.Storage, 'setResource');
      await DRM.prepareSnapshotByDelete(instance, { transaction: { options } });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('prepareSnapshotByUpdate', () => {
    test('success', async () => {
      const options = { requestId: uuid(), openTcc: true };
      const instance = await Models.firstDemo.create({ id: options.requestId }, { hooks: false });

      const spy = jest.spyOn(DRM.Storage, 'setResource');
      await DRM.prepareSnapshotByUpdate(instance, { transaction: { options } });
      expect(spy).toHaveBeenCalled();
    });
  });
});
