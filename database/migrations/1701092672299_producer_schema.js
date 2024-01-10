'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProducerSchema extends Schema {
  up () {
    this.create('producer', (table) => {
      table.uuid('id').primary()
      table.string('name', 80).notNullable()
      table.string('cpf', 11).notNullable().unique()
      table.text('hashed_password').notNullable()
      table.string('email', 254).notNullable().unique()
      table.timestamps(true, true)
    })
  }

  down () {
    this.drop('producer')
  }
}

module.exports = ProducerSchema
