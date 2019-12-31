module.exports = {
  database: {
    postgres: [
      {
        host: '127.0.0.1',
        post: 5432,
        username: 'node_tcc',
        password: 'node_tcc',
        database: 'node_tcc1',
      },
      {
        host: '127.0.0.1',
        post: 5432,
        username: 'node_tcc',
        password: 'node_tcc',
        database: 'node_tcc2',
      },
      {
        host: '127.0.0.1',
        post: 5432,
        username: 'node_tcc',
        password: 'node_tcc',
        database: 'node_tcc3',
      },
    ],
    mysql: [],
    mariadb: [],
    redis: {
      port: 6379,
      host: '127.0.0.1',
      family: 6,
      db: 0,
    },
  },
};
