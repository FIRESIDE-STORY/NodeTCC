const uuid = require('uuid/v1');
const Models = require('../support/models');

describe('snapshotLog', () => {
  const id = uuid();

  test('create', async () => {
    const snapshot = await Models.snapshotLog.create({ id, requestId: uuid() });
    expect(snapshot).not.toBe(null);
  });

  test('update', async () => {
    const snapshot = await Models.snapshotLog.update({ requestId: uuid() }, { where: { id } });
    expect(snapshot).not.toBe(null);
  });

  test('delete', async () => {
    const snapshot = await Models.snapshotLog.destroy({ where: { id } });
    expect(snapshot).toBe(1);
  });

  describe('transaction', () => {
    test('delete', async () => {
      const id = uuid();
      try {
        await Models.snapshotLog.sequelize.transaction(async transaction => {
          await Models.snapshotLog.create({ id, requestId: uuid() }, { transaction });
          throw Error();
        });
      } catch (error) {
        expect(await Models.snapshotLog.findOne({ where: { id } })).toBe(null);
      }
    });
  });
});
