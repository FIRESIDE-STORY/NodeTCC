const uuid = require('uuid/v1');
const redisConfig = require('../support/config').database.redis;
const redis = require('./share_cache')(redisConfig);

describe('cache', () => {
  const key1 = uuid();
  const key2 = uuid();

  test('setCache', async () => {
    expect(await redis.setCache(key1, { key1: 1 })).toBe('OK');
    expect(await redis.setCache(key2, { key2: 2 })).toBe('OK');
  });

  test('getCache', async () => {
    expect(await redis.getCache(key1)).toStrictEqual({ key1: 1 });
    expect(await redis.getCache(key2)).toStrictEqual({ key2: 2 });
  });

  test('delCache', async () => {
    expect(await redis.delCache(key1)).toBe(1);
    expect(await redis.delCache(key2)).toBe(1);
  });

  test('msetCache', async () => {
    expect(await redis.msetCache({ [key1]: 1, [key2]: 2 })).toBe('OK');
  });

  test('mgetCache', async () => {
    expect(await redis.mgetCache([key1, key2])).toStrictEqual([1, 2]);
  });
});
