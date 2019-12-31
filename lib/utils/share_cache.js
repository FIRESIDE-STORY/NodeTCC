const Redis = require('ioredis');
const bluebird = require('bluebird');

bluebird.promisifyAll(Redis.prototype);
bluebird.promisifyAll(Redis.Cluster.prototype);

class Cache {
  constructor(config, redisOptions) {
    this._redis = new Redis(config, redisOptions);
  }

  stingify(value) {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  }

  parse(value) {
    return JSON.parse(value);
  }

  async getCache(key) {
    const value = await this._redis.get(key);
    return this.parse(value);
  }

  async mgetCache(keys) {
    const values = await this._redis.mget(keys);
    return values.map(item => this.parse(item));
  }

  async setCache(key, value, ttl) {
    if (ttl === undefined) {
      return await this._redis.set(key, this.stingify(value));
    }

    return await this._redis.set(key, this.stingify(value), 'EX', ttl);
  }

  async msetCache(obj, ttl) {
    if (ttl === undefined) {
      return await this._redis.mset(obj);
    }

    return await this._redis.mset(obj, 'EX', ttl);
  }

  async delCache(key) {
    return await this._redis.del(key);
  }
}

const getInstance = () => {
  let cache = null;

  return function() {
    if (!cache) {
      cache = new Cache(...arguments);
    }

    return cache;
  };
};

module.exports = getInstance();
