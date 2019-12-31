const NodeCache = require('node-cache');
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 600, useClones: false });

module.exports = {
  memoryCache,

  getCache(key) {
    return memoryCache.get(key);
  },

  setCache(key, value, ttl = 60) {
    return memoryCache.set(key, value, ttl);
  },

  mgetCache(keys) {
    return memoryCache.mget(keys);
  },

  msetCache(kvs) {
    return memoryCache.mset(kvs);
  },

  delCache(key) {
    return memoryCache.del(key);
  },

  getTtl(key) {
    return memoryCache.getTtl(key);
  },

  setTtl(key, ttl = 60) {
    return memoryCache.ttl(key, ttl);
  },

  flushAll() {
    return memoryCache.flushAll();
  },
};
