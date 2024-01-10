'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OccurrenceSchema extends Schema {
  up () {
    this.create('occurrence', (table) => {
      table.uuid('id').primary()
      table.datetime('date').notNullable()
      table.text('type').notNullable()
      table.text('description').notNullable()
      table.text('geolocalization').notNullable()
      table.text('vegetation').notNullable()
      table.text('water_resource').notNullable()
      table.text('organic_honey_risk').notNullable()
      table.timestamps(true,true)
    })
  }

  down () {
    this.drop('occurrence')
  }
}

module.exports = OccurrenceSchema
