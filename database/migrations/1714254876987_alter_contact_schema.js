'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterContactSchema extends Schema {
  up () {
    this.table('contact_request', (table) => {
      table.dropUnique(['phone_number'])
      table.dropUnique(['email'])
    })
  }

  down () {
    this.table('contact_request', (table) => {
      table.unique(['phone_number'])
      table.unique(['email'])
    })
  }
}

module.exports = AlterContactSchema
