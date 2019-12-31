### 一、简介

这是一个分布式事务框架，支持 Mysql、Postgres、Mariadb、Sqlite, 功能如下:

- [x] 资源管理器，追踪事务数据的读写操作，保存数据快照，
- [x] 事务协调器，开启子事务，并将其添加至全局事务，
- [x] 事务管理器，设置全局事务隔离级别、超时时间，管理全局/子事务的挂起、提交、回滚

#### roadmap

- [ ] 内存模式下的事务处理，基于 redis 实现关注高性能，不保证全局事务的原子性
- [ ] RPC 调用下的事务处理，针对微服务，消息队列等, 基于中间件实现
- [ ] 基于 redis 的 Undo Log，实现去全局事务的隔离级别、并发提交及回滚处理

### 二、用例

```js
const NodeTCC = require('node-tcc');

/**
 * @param Models: sequelize Model
 * @param durable
 * - true   内存模式，
 * - false  持久化模式，
 */
NodeTCC.init(Models, redisConfig, { durable: true, tccDB: sequelize });

/**
 * 针对三种不同数据源resourceA、resourceB、resourceC，做写操作
 *
 * @param {Object} options
 * @param {String} options.isolationLevel 全局事务隔离级别，默认READ_UNCOMMITTED
 *  - READ_UNCOMMITTED: 读未提交
 *  - READ_COMMITTED:   读已提交
 *  - REPEATABLE_READ:  可重复读
 *  - SERIALIZABLE:     串行化
 * @param {Number} options.timeout 超时时间，默认3000秒
 * @param {Transaction} gt 事务协调器, start:添加子事务,其中任何一方失败，全局事务将回滚, 返回Promise。
 */
NodeTCC.transaction(options, async gt => {
  await resourceA.create({ amount: 1 }, { transaction: await gt.start(resourceA, options) });
  await resourceB.create({ amount: 2 }, { transaction: await gt.start(resourceB, options) });
  await resourceC.create({ amount: 3 }, { transaction: await gt.start(resourceC, options) });
});
```

- 备注

```
1、全局事务依赖Hook，请勿禁用
```
