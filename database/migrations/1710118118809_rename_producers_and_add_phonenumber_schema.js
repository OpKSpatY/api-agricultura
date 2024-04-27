'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RenameProducersAndAddPhonenumberSchema extends Schema {
  up () {
    this.rename('producer', 'producers')
    this.table('producers', (table) => {
      table.string('phonenumber', 20)
    })
  }

  down () {
    this.table('producers', (table) => {
      table.dropColumn('phonenumber')
    })
    this.rename('producers', 'producer')
  }
}

module.exports = RenameProducersAndAddPhonenumberSchema
