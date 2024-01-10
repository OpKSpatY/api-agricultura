'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductionTypesSchema extends Schema {
  up () {
    this.create('production_types', (table) => {
      table.uuid('id').primary()
      table.string('title', 255).notNullable()
      table.timestamps(true, true)
    })
  }

  down () {
    this.drop('production_types')
  }
}

module.exports = ProductionTypesSchema
