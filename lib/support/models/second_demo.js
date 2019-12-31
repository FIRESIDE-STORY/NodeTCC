const Sequelize = require('sequelize');
const { sequelize2 } = require('../sequelize');

module.exports = sequelize2.define(
  'secondDemo',
  {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
    },
    name: {
      type: Sequelize.STRING(1024),
      field: 'name',
    },
    amount: {
      type: Sequelize.DECIMAL(19, 4),
    },
    quantity: {
      type: Sequelize.FLOAT,
      field: 'qty',
    },
    price: {
      type: Sequelize.DECIMAL(19, 4),
      field: 'price',
    },

    createdAt: { type: Sequelize.DATE, field: 'created_at' },
    updatedAt: { type: Sequelize.DATE, field: 'updated_at' },
    deletedAt: { type: Sequelize.DATE, field: 'deleted_at' },
  },
  {
    paranoid: true,
    underscored: true,
    tableName: 'demos',
  }
);
