'use strict'

const { v4: uuidv4 } = require('uuid');
const ProductionType = use('App/Models/ProductionType')

class ProductionTypeController {
  async create({ request, response }) {
    try {
      const data = request.only([
        'title',
      ])

      const productionType = await ProductionType.create({id: uuidv4(), title: data.title})

      return response.status(201).json({ message: 'Tipo de Produção criado com sucesso', data: productionType })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Erro ao criar tipo de produção'})
    }
  }
}

module.exports = ProductionTypeController