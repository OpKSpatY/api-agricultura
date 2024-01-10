'use strict'

const { v4: uuidv4 } = require('uuid');
const Contact = use('App/Models/Contact')
const { removeMaskFromPhoneNumber} = require('../../Helpers/clearPhoneNumberMask')
const validationMessagesModule  = require('../../Validators/ValidationMessages')
const { validate } = use('Validator')

class ContactController {
  async create({ request, response }) {
    try {
      const { name, cell_number, email, message } = request.only([
        'name',
        'cell_number',
        'email',
        'message'
      ])

      const validationRules = {
        name: 'required|string|max:80',
        cell_number: 'required|string',
        email: 'required|email',
        message: 'required|string',
      };

      const validationMessages = {
        'name.required': validationMessagesModule.required('name'),
        'name.string': validationMessagesModule.string('name'),
        'email.required': validationMessagesModule.required('email'),
        'email.email': validationMessagesModule.email('email'),
        'cell_number.required': validationMessagesModule.required('cell_number'),
        'cell_number.string': validationMessagesModule.string('number'),
        'message.required': validationMessagesModule.required('message'),
        'message.string': validationMessagesModule.string('message'),
      };

      const validation = await validate(request.all(), validationRules, validationMessages)

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }
      const phoneNumberWithoutMask = removeMaskFromPhoneNumber(cell_number);
      if(phoneNumberWithoutMask.length < 11 || phoneNumberWithoutMask.length > 11){
        return response.status(500).json({ message: 'O número de telefone fornecido é inválido.'})
      }

      const contactRequest = await Contact.create({id: uuidv4(), name: name, phone_number: Number(phoneNumberWithoutMask), email: email, message: message})

      return response.status(201).send({
        contact_request_id: contactRequest.id,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Erro ao criar solicitação de contato'})
    }
  }
}

module.exports = ContactController