'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterProductionsTableSchema extends Schema {
  up () {
    this.rename('production', 'productions')

    this.table('productions', (table) => {
      table.renameColumn('surname', 'nickname')
    })
  }

  down () {
    this.table('productions', (table) => {
      table.renameColumn('nickname', 'surname')
    })

    this.rename('productions', 'production')
  }
}

module.exports = AlterProductionsTableSchema
