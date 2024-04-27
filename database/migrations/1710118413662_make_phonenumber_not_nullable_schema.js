'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MakePhonenumberNotNullableSchema extends Schema {
  up () {
    this.table('producers', (table) => {
      table.string('phonenumber').notNullable().alter()
    })
  }

  down () {
    this.table('producers', (table) => {
      table.string('phonenumber').nullable().alter()
    })
  }
}

module.exports = MakePhonenumberNotNullableSchema
