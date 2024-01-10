'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ContactSchema extends Schema {
  up () {
    this.create('contact_request', (table) => {
      table.uuid('id').primary()
      table.string('name', 80).notNullable()
      table.varchar('phone_number', 12).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.text('message').notNullable()
      table.boolean('is_responded').defaultTo(false)
      table.timestamps(true, true)
    })
  }

  down () {
    this.drop('contact_request')
  }
}

module.exports = ContactSchema
