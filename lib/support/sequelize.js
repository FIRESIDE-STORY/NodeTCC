const Sequelize = require('sequelize');
const postgresConfigs = require('./config').database.postgres;

const getPostGresConfig = config => {
  return {
    host: config.host,
    dialect: 'postgres',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
    },
    logging: false,
  };
};

const sequelize1 = new Sequelize(
  postgresConfigs[0].database,
  postgresConfigs[0].username,
  postgresConfigs[0].password,
  getPostGresConfig(postgresConfigs[0])
);

const sequelize2 = new Sequelize(
  postgresConfigs[1].database,
  postgresConfigs[1].username,
  postgresConfigs[1].password,
  getPostGresConfig(postgresConfigs[1])
);

const sequelize3 = new Sequelize(
  postgresConfigs[2].database,
  postgresConfigs[2].username,
  postgresConfigs[2].password,
  getPostGresConfig(postgresConfigs[2])
);

module.exports = {
  sequelize1,
  sequelize2,
  sequelize3,
};
