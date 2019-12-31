const uuid = require('uuid');
const cache = require('./memory_cache');

describe('cache', () => {
  const key1 = uuid();
  const key2 = uuid();

  test('setCache', () => {
    expect(cache.setCache(key1, 1)).toBe(true);
    expect(cache.setCache(key2, 2)).toBe(true);
  });

  test('getCache', () => {
    expect(cache.getCache(key1)).toBe(1);
    expect(cache.getCache(key2)).toBe(2);
  });

  test('msetCache', () => {
    expect(
      cache.msetCache([
        { key: key1, val: 3 },
        { key: key2, val: 4 },
      ])
    ).toBe(true);
  });

  test('mgetCache', () => {
    const data = cache.mgetCache([key1, key2]);
    expect(data[key1]).toBe(3);
    expect(data[key2]).toBe(4);
  });

  test('delCache', () => {
    expect(cache.delCache(key1)).toBe(1);
  });

  test('setTtl', () => {
    expect(cache.setTtl(key2)).toBe(true);
  });

  test('getTtl', () => {
    expect(cache.getTtl(key2)).toBeDefined();
  });
});
