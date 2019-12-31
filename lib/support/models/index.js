/**
 * Just for test
 */
const { sequelize1, sequelize2, sequelize3 } = require('../sequelize');
const snapshotHooks = require('../../snapshot/snapshot_hooks');
const Models = require('./models');

sequelize1.sync({});
sequelize2.sync({});
sequelize3.sync({});

snapshotHooks.addHooks(sequelize1);
snapshotHooks.addHooks(sequelize2);
snapshotHooks.addHooks(sequelize3);

module.exports = Models;
