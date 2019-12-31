const uuid = require('uuid/v1');
const Sequelize = require('sequelize');

const { DRM } = require('./resource_manager');

class DTC {
  constructor(options = {}) {
    this._traceInfo = { openTcc: true, requestId: uuid(), tccName: 'master' };
    this._options = Object.assign(options, this._traceInfo);
    this._branches = [];
    this.requestId = this._options.requestId;
  }

  getBranches() {
    return this._branches;
  }

  async start(model, options = {}) {
    if (!model || DRM.Models[model.name] !== model) {
      throw Error();
    }

    const transaction = new Sequelize.Transaction(
      model.sequelize,
      Object.assign(options, this._traceInfo, { tccName: 'branch' })
    );

    this._branches.push(transaction);

    return transaction.prepareEnvironment(false).return(transaction);
  }
}

module.exports = DTC;
