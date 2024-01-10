'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductionSchema extends Schema {
  up () {
    this.create('production', (table) => {
      table.uuid('id').primary()
      table.string('surname', 200).notNullable()
      table.text('description').notNullable()
      table.float('latitude')
      table.float('longitude')
      table.uuid('producer_id').references('id').inTable('producer').notNullable()
      table.text('notes')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.timestamps(true, true)
    })
  }

  down () {
    this.drop('production')
  }
}

module.exports = ProductionSchema
