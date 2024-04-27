const Production = use('App/Models/Production')
const Producer = use('App/Models/Producer')
const ProductionType = use('App/Models/ProductionType')
const { validate } = use('Validator')
const { v4: uuidv4 } = require('uuid')
const dayjs = require('dayjs')
const validationMessagesModule = require('../../Validators/ValidationMessages')
const Validations = require('../../shared/validations/validations')

/**
 * @module ProductionController
 * @description Controlador para criar, listar, atualizar e deletar produções
 */

class ProductionController {
  /**
   * Cria uma nova produção.
   *
   * @function createProduction
   * @description Cria uma nova produção.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params - Os parâmetros da requisição.
   * @param {string} params.user_id - O ID do usuário.
   * @param {string} request.name - O nome da produção.
   * @param {string} request.description - A descrição da produção.
   * @param {string} [request.notes] - As notas da produção.
   * @param {string} request.start_date - A data de início da produção.
   * @param {string} request.end_date - A data de término da produção.
   * @param {number} [request.latitude] - A latitude da produção.
   * @param {number} [request.longitude] - A longitude da produção.
   * @param {string} request.production_type_id - O ID do tipo de produção.
   * @returns {Object} Retorna o ID da nova produção.
   *
   * @throws {Error} Retorna um erro 500 se ocorrer um erro durante a criação da produção.
   * @throws {Error} Retorna um erro 400 se o ID do usuário não for informado.
   * @throws {Error} Retorna um erro 400 se as datas estiverem no formato incorreto.
   * @throws {Error} Retorna um erro 500 se não for possível criar a produção.
   */
  async createProduction({ params, request, response }) {
    const { user_id } = params
    const data = request.only([
      'name',
      'description',
      'notes',
      'start_date',
      'end_date',
      'latitude',
      'longitude',
      'production_type_id',
    ])

    try {
      const validationRules = {
        name: 'required|string|max:200',
        description: 'required|string',
        notes: 'string',
        latitude: 'number',
        longitude: 'number',
        start_date: 'required|date',
        end_date: 'required|date',
        production_type_id: 'required|string',
      }

      const validationMessages = {
        'name.required': validationMessagesModule.required('nome'),
        'name.string': validationMessagesModule.string('nome'),
        'name.max': validationMessagesModule.max('nome', 200),
        'description.required': validationMessagesModule.required('descrição'),
        'description.string': validationMessagesModule.string('descrição'),
        'notes.string': validationMessagesModule.string('notas'),
        'latitude.number': validationMessagesModule.number('latitude'),
        'longitude.number': validationMessagesModule.number('longitude'),
        'start_date.required':
          validationMessagesModule.required('data de início'),
        'start_date.date': validationMessagesModule.date('data de início'),
        'end_date.required':
          validationMessagesModule.required('data de término'),
        'end_date.date': validationMessagesModule.date('data de término'),
        'production_type_id.required':
          validationMessagesModule.required('production_type_id'),
        'production_type_id.string':
          validationMessagesModule.string('production_type_id'),
      }

      const validation = await validate(
        data,
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      if (!user_id) {
        return response
          .status(400)
          .send([{ message: 'ID do usuário é obrigatório.' }])
      }

      const isValidStartDate = dayjs(data.start_date, {
        strict: true,
        iso: true,
      }).isValid()
      const isValidEndDate = dayjs(data.end_date, {
        strict: true,
        iso: true,
      }).isValid()

      if (!isValidStartDate || !isValidEndDate) {
        return response
          .status(400)
          .send({ message: 'Datas no formato incorreto.' })
      }

      const formattedStartDate = dayjs(data.start_date).format('YYYY-MM-DD')
      const formattedEndDate = dayjs(data.end_date).format('YYYY-MM-DD')

      try {
        const newProduction = await Production.create({
          id: uuidv4(),
          nickname: data.name,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          producer_id: user_id,
          notes: data.notes,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          production_type_id: data.production_type_id,
        })

        return response.status(201).send({
          production_id: newProduction.id,
        })
      } catch (error) {
        console.log(error)
        return response.status(500).send({
          message: 'Não foi possível finalizar a requisição.',
        })
      }
    } catch (error) {
      console.log(error)
      return response.status(500).send({ message: 'Erro de validação.' })
    }
  }

  /**
   * Obtém os detalhes de uma produção.
   *
   * @function getProduction
   * @description Obtém os detalhes de uma produção.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params - Os parâmetros da requisição.
   * @param {string} params.production_id - O ID da produção.
   * @returns {Object} Retorna os detalhes da produção.
   *
   * @throws {Error} Retorna um erro 400 se o ID da produção não for informado.
   * @throws {Error} Retorna um erro 404 se a produção não for encontrada.
   * @throws {Error} Retorna um erro 500 se não for possível obter a produção.
   */
  async getProduction({ params, response }) {
    try {
      const { production_id } = params

      if (!production_id) {
        return response
          .status(400)
          .send({ message: 'ID da produção é obrigatório.' })
      }

      const production = await Production.query()
        .where('id', production_id)
        .select(
          'id',
          'nickname',
          'description',
          'latitude',
          'longitude',
          'created_at',
          'notes'
        )
        .first()

      if (!production) {
        return response
          .status(404)
          .send({ message: 'Produção não encontrada.' })
      }

      return response.status(200).send(production)
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ message: 'Não foi possível obter a produção.' })
    }
  }

  /**
   * Obtém a lista de produções.
   *
   * @function getProductionsList
   * @description Obtém a lista de produções.
   * @param {Response} response - O objeto de resposta.
   * @returns {Object} Retorna a lista de produções.
   *
   * @throws {Error} Retorna um erro 500 se não for possível obter as produções.
   */
  async getProductionsList({ response }) {
    try {
      const productions = await Production.query()
        .select('id', 'nickname')
        .fetch()

      return response.status(200).send(productions)
    } catch (error) {
      console.log(error)
      return response.status(500).send({
        message: 'Não foi possível obter as produções.',
        error: error,
      })
    }
  }

  /**
   * Atualiza uma produção existente.
   *
   * @function updateProduction
   * @description Atualiza uma produção existente.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params - Os parâmetros da rota.
   * @param {string} params.production_id - O ID da produção a ser atualizada.
   * @param {string} request.body.nickname - O apelido da produção.
   * @param {string} request.body.description - A descrição da produção.
   * @param {number} request.body.latitude - A latitude da localização da produção.
   * @param {number} request.body.longitude - A longitude da localização da produção.
   * @param {string} request.body.producer_id - O ID do produtor responsável pela produção.
   * @param {string} request.body.notes - Observações sobre a produção.
   * @param {string} request.body.start_date - A data de início da produção.
   * @param {string} request.body.end_date - A data de término da produção.
   * @param {string} request.body.production_type_id - O ID do tipo de produção.
   * @returns {Object} Retorna uma mensagem de sucesso.
   *
   * @throws {Error} Retorna um erro 404 se o ID da produção não for informado.
   * @throws {Error} Retorna um erro 500 se não for possível atualizar a produção.
   */
  async updateProduction({ request, response, params }) {
    const { production_id } = params

    try {
      const {
        nickname,
        description,
        latitude,
        longitude,
        producer_id,
        notes,
        start_date,
        end_date,
        production_type_id,
      } = request.only([
        'nickname',
        'description',
        'latitude',
        'longitude',
        'producer_id',
        'notes',
        'start_date',
        'end_date',
        'production_type_id',
      ])

      const validationRules = {
        nickname: 'string|max:200',
        description: 'string',
        notes: 'string',
        latitude: 'number',
        longitude: 'number',
        start_date: 'date',
        end_date: 'date',
        production_type_id: 'string',
      }

      const validationMessages = {
        'nickname.string': validationMessagesModule.string('nickname'),
        'nickname.max': validationMessagesModule.max('nickname', 200),
        'description.string': validationMessagesModule.string('descrição'),
        'notes.string': validationMessagesModule.string('notas'),
        'latitude.number': validationMessagesModule.number('latitude'),
        'longitude.number': validationMessagesModule.number('longitude'),
        'start_date.date': validationMessagesModule.date('data de início'),
        'end_date.date': validationMessagesModule.date('data de término'),
        'production_type_id.string':
          validationMessagesModule.string('production_type_id'),
      }

      const validation = await validate(
        request.all(),
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      if (!production_id) {
        return response.status(404).json({ message: 'Produção não informada.' })
      }

      const production = await Production.find(production_id)

      if (!production) {
        return response
          .status(404)
          .json({ message: 'Produção não encontrada.' })
      }

      if (nickname) {
        production.nickname = nickname
      }

      if (description) {
        production.description = description
      }

      if (latitude) {
        production.latitude = latitude
      }

      if (longitude) {
        production.longitude = longitude
      }

      if (producer_id) {
        const user = await Producer.findBy('id', producer_id)
        if (!user) {
          return response
            .status(404)
            .json({ message: 'Usuário não encontrado.' })
        }
        production.producer_id = producer_id
      }

      if (notes) {
        production.notes = notes
      }

      if (start_date) {
        production.start_date = start_date
      }

      if (end_date) {
        production.end_date = end_date
      }

      if (production_type_id) {
        production.production_type_id = production_type_id
      }

      await production.save()

      return response.json({ message: 'Produção atualizada com sucesso' })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ error: 'Erro ao atualizar a produção' })
    }
  }

  /**
   * Obtém a lista de produções de um usuário.
   *
   * @function getMyProductionsList
   * @description Obtém a lista de produções de um usuário.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params - Os parâmetros da requisição.
   * @param {string} params.user_id - O ID do usuário.
   * @returns {Object} Retorna a lista de produções do usuário.
   *
   * @throws {Error} Retorna um erro 500 se não for possível obter as produções.
   */
  async getMyProductionsList({ params, response }) {
    const { user_id } = params
    try {
      const productions = await Production.query()
        .select('id', 'nickname')
        .where('producer_id', user_id)
        .fetch()

      if (productions.rows.length == 0) {
        return response.status(204).send()
      }

      return response.status(200).send(productions)
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ message: 'Não foi possível obter as produções.' })
    }
  }

  /**
   * Busca produções de um usuário por tipo.
   *
   * @function searchForProductionByType
   * @description Busca produções de um usuário por tipo.
   * @param {Params} params - O parâmetro da requisição.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {object} params - Os parâmetros da requisição.
   * @param {string} params.production_type_value - O valor do tipo de produção.
   * @returns {Object} Retorna a lista de produções do usuário por tipo.
   *
   * @throws {Error} Retorna um erro 401 se o ID do usuário não for um UUID válido.
   * @throws {Error} Retorna um erro 404 se o tipo de produção não for encontrado.
   * @throws {Error} Retorna um erro 500 se não for possível obter as produções.
   */
  async searchForProductionByType({ params, request, response }) {
    const { production_type_value } = params
    const { user_id } = request.only(['user_id'])
    try {
      const isUserIdValid = await Validations.uuid(user_id, 'Id do usuário')
      if (!isUserIdValid.validate)
        return response.status(401).send(isUserIdValid.error)

      let title
      switch (production_type_value) {
        case 'apiario':
          title = 'Apiário'
          break
        case 'meliponarios':
          title = 'Meliponários'
          break
        case 'vegetacao':
          title = 'Vegetação'
          break
        case 'recursos-hidricos':
          title = 'Recursos Hídricos'
          break
        default:
          return response
            .status(404)
            .send({ message: 'Tipo de produção não encontrado.' })
      }

      const production_type = await ProductionType.findBy('title', title)

      const productions = await Production.query()
        .select('id', 'nickname')
        .where('producer_id', user_id)
        .where('production_type_id', production_type.id)
        .fetch()

      if (productions.rows.length == 0) {
        return response.status(204).send()
      }
      return response.status(200).send(productions)
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ message: 'Não foi possível obter as produções.' })
    }
  }

  /**
   * Cria um novo tipo de produção.
   *
   * @function createProductionType
   * @description Cria um novo tipo de produção.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {string} request.body.title - O título do tipo de produção a ser criado.
   * @returns {Object} Retorna o tipo de produção criado.
   *
   * @throws {Error} Retorna um erro 500 se não for possível criar o tipo de produção.
   */
  async createProductionType({ request, response }) {
    try {
      const data = request.only(['title'])

      const productionType = await ProductionType.create(data)

      return response.status(201).json({
        message: 'Tipo de Produção criado com sucesso',
        data: productionType,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        message: 'Erro ao criar tipo de produção',
        error: error.message,
      })
    }
  }
}

module.exports = ProductionController
