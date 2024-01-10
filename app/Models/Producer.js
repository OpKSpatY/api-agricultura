'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Producer extends Model {
    static get table() {
        return 'producer'
    }
}

module.exports = Producer
