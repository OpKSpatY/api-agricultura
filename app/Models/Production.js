'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Production extends Model {
    static get table() {
        return 'production'
    }
}

module.exports = Production
