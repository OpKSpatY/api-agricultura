'use strict'

/*
|--------------------------------------------------------------------------
| ProducerSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Producer = use('App/Models/Producer');
const { v4: uuidv4 } = require('uuid');
const Factory = use('Factory');
const Hash = use('Hash')
const { faker } = require('@faker-js/faker');

class ProducerSeeder {
  static environment = ['testing']
  async run () {
    if(process.env.NODE_ENV === 'development'){
      for(let quantity=0; quantity < 20; quantity ++){
        await Producer.create([
          {
            id: uuidv4(),
            name: faker.person.fullName(),
            cpf: faker.string.numeric(11),
            hashed_password: await Hash.make(faker.internet.password()),
            email: faker.internet.email(),
          }
        ]);
      }
    }
  }
}

module.exports = ProducerSeeder;
