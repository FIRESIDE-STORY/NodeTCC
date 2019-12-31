const Promise = require('bluebird');
const debug = require('debug');
const { inspect } = require('util');

const DTC = require('./transaction_coordinator');
const { DRM } = require('./resource_manager');

const TRANSACTION = require('./constants').TRANSACTION;

class DTM {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   *
   * add model & hook
   * @param {*} Models
   * @param {*} options
   */
  static init(Models, redisConfig, options) {
    DRM.setModels(Models, redisConfig, options);
    DRM.setHooks();
  }

  static get STATUS() {
    return TRANSACTION.STATUS;
  }

  static async commitBranch(dt, options) {
    const branches = dt.getBranches();

    await DRM.Storage.saveSnapshot(dt.requestId, options);
    await Promise.all(branches.map(t => t.commit()));
  }

  static async rollbackBranch(dt, options) {
    const branches = await Promise.all(dt.getBranches());

    const finishedBranches = branches.filter(branch => branch.finished);
    const unfinishedBranches = branches.filter(branch => !branch.finished);

    await DRM.rollbackFromSnapshot(dt.requestId, finishedBranches, options);
    await Promise.all(unfinishedBranches.map(t => t.rollback()));
  }

  static async runTimeoutCallback(dt, options) {
    const snapshot = await DRM.Storage.getSnapshot(dt.requestId);

    if (snapshot.STATUS !== DTM.STATUS.PENGDING) {
      return;
    }

    try {
      await DTM.rollback(dt, options);
    } catch (error) {
      console.log(error);
    }
  }

  static async commit(dt, options) {
    await DTM.commitBranch(dt, options);
    await DRM.Storage.changeStatus(dt.requestId, DTM.STATUS.COMMITTED);
  }

  static async rollback(dt, options) {
    await DTM.rollbackBranch(dt, options);
    await DRM.Storage.changeStatus(dt.requestId, DTM.STATUS.ABORTED);
  }

  /**
   * 针对三种不同数据源resourceA、resourceB、resourceC，做写操作
   *
   * @param {Object} options
   * @param {String} options.isolationLevel 设置全局事务级别
   *  - READ_UNCOMMITTED: 读未提交
   *  - READ_COMMITTED:   读已提交
   *  - REPEATABLE_READ:  可重复读
   *  - SERIALIZABLE:     串行化
   * @param {Number} options.timeout 设置全局事务超时时间，默认3000秒
   * @param {Transaction} dt 事务协调器, 添加子事务等。
   */
  static async transaction(options, autoCallback) {
    if (typeof options === 'function') {
      autoCallback = options;
      options = {};
    }

    const dt = new DTC(options);

    setTimeout(() => {
      DTM.runTimeoutCallback(dt, options);
    }, (options && options.timeout) || TRANSACTION.TIMEOUT);

    try {
      await autoCallback(dt);
      await DTM.commit(dt, options);
    } catch (error) {
      debug(`${TRANSACTION.DEBUG}:`, inspect(error));
      await DTM.rollback(dt, options);
    } finally {
      DRM.Storage.delResource(dt.requestId);
    }
  }
}

module.exports = DTM;
