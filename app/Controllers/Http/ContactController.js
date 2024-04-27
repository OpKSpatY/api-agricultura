'use strict'

const { v4: uuidv4 } = require('uuid')
const Contact = use('App/Models/Contact')
const validationMessagesModule = require('../../Validators/ValidationMessages')
const { validate } = use('Validator')

/**
 * @module ContactController
 *
 * @description Controlador responsável por lidar com as solicitações de contato.
 */

class ContactController {
  /**
   * Cria uma nova solicitação de contato.
   *
   * @function create
   * @description Cria uma nova solicitação de contato.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {string} request.body.name - O nome do solicitante.
   * @param {string} request.body.cell_number - O número de telefone do solicitante.
   * @param {string} request.body.email - O email do solicitante.
   * @param {string} request.body.message - A mensagem da solicitação de contato.
   * @returns {Object} Retorna o ID da solicitação de contato criada.
   *
   * @throws {Error} Retorna um erro 400 se houver falha na validação dos dados.
   * @throws {Error} Retorna um erro 500 se o número de telefone fornecido for inválido.
   * @throws {Error} Retorna um erro 500 se não for possível criar a solicitação de contato.
   */
  async create({ request, response }) {
    try {
      const { name, cell_number, email, message } = request.only([
        'name',
        'cell_number',
        'email',
        'message',
      ])

      const validationRules = {
        name: 'required|string|max:80',
        cell_number: 'required|string',
        email: 'required|email',
        message: 'required|string',
      }

      const validationMessages = {
        'name.required': validationMessagesModule.required('name'),
        'name.string': validationMessagesModule.string('name'),
        'email.required': validationMessagesModule.required('email'),
        'email.email': validationMessagesModule.email('email'),
        'cell_number.required':
          validationMessagesModule.required('cell_number'),
        'cell_number.string': validationMessagesModule.string('number'),
        'message.required': validationMessagesModule.required('message'),
        'message.string': validationMessagesModule.string('message'),
      }

      const validation = await validate(
        request.all(),
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      if (cell_number.length < 11 || cell_number.length > 11) {
        return response.status(500).json({
          message: 'O número de telefone fornecido é inválido.',
        })
      }

      const contactRequest = await Contact.create({
        id: uuidv4(),
        name: name,
        phone_number: Number(cell_number),
        email: email,
        message: message,
      })

      return response.status(201).send({
        contact_request_id: contactRequest.id,
      })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao criar solicitação de contato' })
    }
  }
  /**
   * Retorna todas as solicitações de contato.
   *
   * @function index
   * @description Retorna todas as solicitações de contato.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @returns {Object} Retorna um array com todas as solicitações de contato.
   *
   * @throws {Error} Retorna um erro 500 se não for possível obter as solicitações de contato.
   */
  async index({ response }) {
    try {
      const contacts = await Contact.all()

      return response.status(200).send(contacts)
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .json({ message: 'Erro ao obter as solicitações de contato' })
    }
  }
}

module.exports = ContactController
