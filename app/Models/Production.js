'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Production extends Model {
  static get table() {
    return 'productions'
  }
}

module.exports = Production
