'use strict'

const ProductionType = use('App/Models/ProductionType')
const { v4: uuidv4 } = require('uuid')

/**
 * @module ProductionTypeController
 * @description Controlador para criar, listar, atualizar e deletar tipos de produção.
 */

class ProductionTypeController {
  /**
   * Cria um novo tipo de produção.
   *
   * @function create
   * @description Cria um novo tipo de produção.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {string} request.title - O título do tipo de produção a ser criado.
   * @returns {Object} Retorna uma mensagem de sucesso e os dados do tipo de produção criado.
   *
   * @throws {Error} Retorna um erro 500 se não for possível criar o tipo de produção.
   */
  async create({ request, response }) {
    try {
      const data = request.only(['title'])

      const productionType = await ProductionType.create({
        id: uuidv4(),
        title: data.title,
      })

      return response.status(201).json({
        message: 'Tipo de Produção criado com sucesso',
        data: productionType,
      })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao criar tipo de produção' })
    }
  }

  /**
   * Lista todos os tipos de produção.
   *
   * @function index
   * @description Lista todos os tipos de produção.
   * @param {Response} response - O objeto de resposta.
   * @returns {Object} Retorna os tipos de produção.
   *
   * @throws {Error} Retorna um erro 500 se não for possível obter os tipos de produção.
   */
  async index({ response }) {
    try {
      const productionTypes = await ProductionType.all()

      return response.status(200).json({ data: productionTypes })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao obter os tipos de produção' })
    }
  }

  /**
   * Atualiza um tipo de produção existente.
   *
   * @function update
   * @description Atualiza um tipo de produção existente.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params
   * @param {string} params.id - O ID do tipo de produção a ser atualizado.
   * @param {string} request.title - O título do tipo de produção a ser atualizado.
   * @returns {Object} Retorna uma mensagem de sucesso.
   *
   * @throws {Error} Retorna um erro 404 se o tipo de produção não for encontrado.
   * @throws {Error} Retorna um erro 500 se não for possível atualizar o tipo de produção.
   */
  async update({ request, response, params }) {
    const { id } = params

    try {
      const data = request.only(['title'])

      const productionType = await ProductionType.find(id)

      if (!productionType) {
        return response
          .status(404)
          .json({ message: 'Tipo de produção não encontrado' })
      }

      productionType.merge(data)
      await productionType.save()

      return response
        .status(200)
        .json({ message: 'Tipo de produção atualizado com sucesso' })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao atualizar tipo de produção' })
    }
  }

  /**
   * Deleta um tipo de produção existente.
   *
   * @function delete
   * @description Deleta um tipo de produção existente.
   * @param {Params} params - O parâmetro da requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params
   * @param {string} params.id - O ID do tipo de produção a ser deletado.
   * @returns {Object} Retorna uma mensagem de sucesso.
   *
   * @throws {Error} Retorna um erro 404 se o tipo de produção não for encontrado.
   * @throws {Error} Retorna um erro 500 se não for possível deletar o tipo de produção.
   */
  async delete({ response, params }) {
    const { id } = params

    try {
      const productionType = await ProductionType.find(id)

      if (!productionType) {
        return response
          .status(404)
          .json({ message: 'Tipo de produção não encontrado' })
      }

      await productionType.delete()

      return response
        .status(200)
        .json({ message: 'Tipo de produção deletado com sucesso' })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao deletar tipo de produção' })
    }
  }
}

module.exports = ProductionTypeController
