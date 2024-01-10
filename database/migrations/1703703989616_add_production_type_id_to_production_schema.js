'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddProductionTypeIdToProductionSchema extends Schema {
  up () {
    this.table('production', (table) => {
      table.uuid('production_type_id').references('id').inTable('production_types').notNullable()
    })
  }

  down () {
    this.table('production', (table) => {
      table.dropColumn('production_type_id')
    })
  }
}

module.exports = AddProductionTypeIdToProductionSchema
