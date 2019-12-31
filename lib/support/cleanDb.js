const { sequelize1, sequelize2, sequelize3 } = require('../support/sequelize');
const Promise = require('bluebird');

afterAll(async done => {
  return await Promise.all([sequelize1.truncate(), sequelize2.truncate(), sequelize3.truncate()]).then(async () => {
    await Promise.all([sequelize1.close(), sequelize2.close(), sequelize3.close()]);
    done();
  });
}, 7000);
