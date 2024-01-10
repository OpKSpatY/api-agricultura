'use strict'

const Env = use('Env')

module.exports = {
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    port: 6543,
    database: 'agricultura',
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './database/migrations',
  },
}

