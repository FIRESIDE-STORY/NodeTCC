const Promise = require('bluebird');
const uuid = require('uuid/v1');
const Models = require('./support/models');
const redisConfig = require('./support/config').database.redis;

const DTM = require('./transaction_mannager');

DTM.init(Models, redisConfig);

const firstDemo = Models.firstDemo;
const secondDemo = Models.secondDemo;
const thirdDemo = Models.thirdDemo;

describe('transaction_mannager', () => {
  test('sequelize', () => {
    expect(DTM.sequelize).not.toBe(null);
  });

  describe('transaction', () => {
    describe('Create/bulkCreate', () => {
      test('all items should be created', async () => {
        const options = {};
        const id = uuid();

        const autoCallback = async dt => {
          await firstDemo.create({ id, amount: 1 }, { transaction: await dt.start(firstDemo) });
          await secondDemo.create({ id, amount: 2 }, { transaction: await dt.start(secondDemo) });
          await thirdDemo.create({ id, amount: 3 }, { transaction: await dt.start(thirdDemo) });
        };

        await DTM.transaction(options, autoCallback);

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id } }),
          secondDemo.findOne({ where: { id } }),
          thirdDemo.findOne({ where: { id } }),
        ]);

        expect(one.amount).toBe('1.0000');
        expect(two.amount).toBe('2.0000');
        expect(three.amount).toBe('3.0000');
      });

      test('no items to be created if anyone failed', async () => {
        const options = {};
        const id = uuid();

        await DTM.transaction(options, async dt => {
          await firstDemo.create({ id, amount: 1 }, { transaction: await dt.start(firstDemo) });
          await secondDemo.create({ id, amount: 2 }, { transaction: await dt.start(secondDemo) });
          await thirdDemo.create({ id, amount: 3 }, { transaction: await dt.start(thirdDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id } }),
          secondDemo.findOne({ where: { id } }),
          thirdDemo.findOne({ where: { id } }),
        ]);

        expect(one).toBe(null);
        expect(two).toBe(null);
        expect(three).toBe(null);
      });
    });

    describe('update', () => {
      test('all items should be updated', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const hooks = { hooks: false };

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await demo1.update({ amount: 111 }, { transaction: await dt.start(firstDemo) });
          await demo2.update({ amount: 222 }, { transaction: await dt.start(secondDemo) });
          await demo3.update({ amount: 333 }, { transaction: await dt.start(thirdDemo) });
        });

        const [one, two, three] = await Promise.all([demo1.reload(), demo2.reload(), demo3.reload()]);

        expect(one.amount).toBe('111.0000');
        expect(two.amount).toBe('222.0000');
        expect(three.amount).toBe('333.0000');
      });

      test('no items to be created if anyone failed', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const hooks = { hooks: false };

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await demo1.update({ amount: 111 }, { transaction: await dt.start(firstDemo) });
          await demo2.update({ amount: 222 }, { transaction: await dt.start(secondDemo) });
          await demo3.update({ amount: 333 }, { transaction: await dt.start(thirdDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([demo1.reload(), demo2.reload(), demo3.reload()]);

        expect(one.amount).toBe('11.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });
    });

    describe('bulkUpdate', () => {
      test('all items should be updated', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const hooks = { hooks: false };

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await firstDemo.update(
            { amount: 0 },
            { where: { id: [id1, id2, id3] }, transaction: await dt.start(firstDemo) }
          );
        });

        const [one, two, three] = await Promise.all([demo1.reload(), demo2.reload(), demo3.reload()]);

        expect(one.amount).toBe('0.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });

      test('no items to be created if anyone failed', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const hooks = { hooks: false };

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await firstDemo.update({ amount: 111 }, { where: { id: id1 }, transaction: await dt.start(firstDemo) });
          await secondDemo.update({ amount: 222 }, { where: { id: id2 }, transaction: await dt.start(secondDemo) });
          await thirdDemo.update({ amount: 333 }, { where: { id: id3 }, transaction: await dt.start(thirdDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([demo1.reload(), demo2.reload(), demo3.reload()]);

        expect(one.amount).toBe('11.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });
    });

    describe('bulkDelete', () => {
      test('all items should be deleted', async () => {
        const options = {};
        const hooks = { hooks: false };

        await firstDemo.create({ amount: 11 }, hooks);
        await secondDemo.create({ amount: 22 }, hooks);
        await thirdDemo.create({ amount: 33 }, hooks);

        await DTM.transaction(options, async gt => {
          await firstDemo.destroy({ where: { amount: 11 }, transaction: await gt.start(firstDemo) });
          await secondDemo.destroy({ where: { amount: 22 }, transaction: await gt.start(secondDemo) });
          await thirdDemo.destroy({ where: { amount: 33 }, transaction: await gt.start(thirdDemo) });
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { amount: 11 } }),
          secondDemo.findOne({ where: { amount: 22 } }),
          thirdDemo.findOne({ where: { amount: 33 } }),
        ]);

        expect(one).toBe(null);
        expect(two).toBe(null);
        expect(three).toBe(null);
      });

      test('no items to be deleted if anyone failed', async () => {
        const options = {};
        const hooks = { hooks: true };

        await firstDemo.create({ amount: 11 }, hooks);
        await secondDemo.create({ amount: 22 }, hooks);
        await thirdDemo.create({ amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await firstDemo.destroy({ where: { amount: 11 }, transaction: await dt.start(secondDemo) });
          await secondDemo.destroy({ where: { amount: 22 }, transaction: await dt.start(secondDemo) });
          await thirdDemo.destroy({ where: { amount: 33 }, transaction: await dt.start(secondDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { amount: 11 } }),
          secondDemo.findOne({ where: { amount: 22 } }),
          thirdDemo.findOne({ where: { amount: 33 } }),
        ]);

        expect(one.amount).toBe('11.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });
    });

    describe('delete', () => {
      test('all items should be destroy', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const hooks = { hooks: false };

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async gt => {
          await demo1.destroy({ transaction: await gt.start(firstDemo) });
          await demo2.destroy({ transaction: await gt.start(secondDemo) });
          await demo3.destroy({ transaction: await gt.start(thirdDemo) });
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id: id1 } }),
          secondDemo.findOne({ where: { id: id2 } }),
          thirdDemo.findOne({ where: { id: id3 } }),
        ]);

        expect(one).toBe(null);
        expect(two).toBe(null);
        expect(three).toBe(null);
      });

      test('no items to be created if anyone failed', async () => {
        const options = {};
        const hooks = { hooks: true };

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await demo1.destroy({ transaction: await dt.start(firstDemo) });
          await demo2.destroy({ transaction: await dt.start(secondDemo) });
          await demo3.destroy({ transaction: await dt.start(thirdDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id: id1 } }),
          secondDemo.findOne({ where: { id: id2 } }),
          thirdDemo.findOne({ where: { id: id3 } }),
        ]);

        expect(one.amount).toBe('11.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });
    });

    describe.skip('upsert', () => {
      test('all items should be destroy', async () => {
        const options = {};

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        await DTM.transaction(options, async gt => {
          await firstDemo.upsert({ id: id1, amount: 1 }, { transaction: await gt.start(firstDemo) });
          await secondDemo.upsert({ id: id2, amount: 2 }, { transaction: await gt.start(secondDemo) });
          await thirdDemo.upsert({ id: id3, amount: 3 }, { transaction: await gt.start(thirdDemo) });
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id: id1 } }),
          secondDemo.findOne({ where: { id: id2 } }),
          thirdDemo.findOne({ where: { id: id3 } }),
        ]);

        expect(one).toBe(null);
        expect(two).toBe(null);
        expect(three).toBe(null);
      });

      test('no items to be created if anyone failed', async () => {
        const options = {};
        const hooks = { hooks: true };

        const id1 = uuid();
        const id2 = uuid();
        const id3 = uuid();

        const demo1 = await firstDemo.create({ id: id1, amount: 11 }, hooks);
        const demo2 = await secondDemo.create({ id: id2, amount: 22 }, hooks);
        const demo3 = await thirdDemo.create({ id: id3, amount: 33 }, hooks);

        await DTM.transaction(options, async dt => {
          await demo1.destroy({ transaction: await dt.start(firstDemo) });
          await demo2.destroy({ transaction: await dt.start(secondDemo) });
          await demo3.destroy({ transaction: await dt.start(thirdDemo) });
          throw Error('Maybe no power...');
        });

        const [one, two, three] = await Promise.all([
          firstDemo.findOne({ where: { id: id1 } }),
          secondDemo.findOne({ where: { id: id2 } }),
          thirdDemo.findOne({ where: { id: id3 } }),
        ]);

        expect(one.amount).toBe('11.0000');
        expect(two.amount).toBe('22.0000');
        expect(three.amount).toBe('33.0000');
      });
    });
  });
});
