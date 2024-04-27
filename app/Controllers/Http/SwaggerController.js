'use strict'

const View = use('View')
const Route = use('Route')

/**
 * @module SwaggerController
 * @description Controlador para renderizar a página Swagger UI e retornar o arquivo JSON do Swagger.
 */

class SwaggerController {
  /**
   * Renderiza a página Swagger UI.
   * @function show
   * @description Renderiza a página Swagger UI.
   * @returns {View.render} A página Swagger UI renderizada.
   */
  async show({ view }) {
    return view.render('swagger')
  }

  /**
   * Retorna o arquivo JSON do Swagger.
   * @function getJson
   * @description Retorna o arquivo JSON do Swagger.
   * @param {Response} response - O objeto de resposta.
   */
  async getJson({ response }) {
    try {
      response.header('Content-Type', 'application/json')
      response.send(require('../../../swagger.json'))
    } catch (error) {
      console.error(error)
      response.status(500).send({ error: 'Internal Server Error' })
    }
  }
}

module.exports = SwaggerController
