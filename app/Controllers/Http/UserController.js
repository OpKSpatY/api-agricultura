'use strict'
const Producer = use('App/Models/Producer')
const Database = use('Database')
const Hash = use('Hash')
const { validate } = use('Validator')
const { limparCpf, formatarCpf } = require('../../Helpers/clearCPF')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const Env = use('Env')
const validationMessagesModule = require('../../Validators/ValidationMessages')

/**
 * @module UserController
 * @description Descreve os métodos do usuário
 */

class UserController {
  /**
   * @function createUser
   * @description Cria um novo usuário e retorna o token de autenticação e o id do usuário.
   *
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {Auth} auth - O objeto de autenticação.
   * @param {string} request.name - O nome do usuário.
   * @param {string} request.cpf - O CPF do usuário.
   * @param {string} request.phonenumber - O número de telefone do usuário.
   * @param {string} request.email - O e-mail do usuário.
   * @param {string} request.password - A senha do usuário.
   * @param {string} request.confirm_password - A confirmação da senha do usuário.
   * @returns {object} Retorna o token de autenticação e o id do usuário criado.
   *
   * @throws {Error} Retorna um erro se a requisição não puder ser finalizada.
   * @throws {Error} Retorna um erro se o CPF não tiver 11 dígitos.
   * @throws {Error} Retorna um erro se a senha e a confirmação de senha não coincidirem.
   * @throws {Error} Retorna um erro se o e-mail pertencer a um usuário cadastrado.
   * @throws {Error} Retorna um erro se o CPF pertencer a um usuário cadastrado.
   * @throws {Error} Retorna um erro se o número de telefone for inválido.
   */
  async createUser({ request, response, auth }) {
    try {
      const validationRules = {
        name: 'required|string',
        cpf: 'required|string',
        phonenumber: 'required|string',
        email: 'required|email',
        password: 'required|string',
        confirm_password: 'required|string',
      }

      const validationMessages = {
        'name.required': validationMessagesModule.required('name'),
        'name.string': validationMessagesModule.string('name'),
        'cpf.required': validationMessagesModule.required('cpf'),
        'cpf.string': validationMessagesModule.string('cpf'),
        'phonenumber.required':
          validationMessagesModule.required('phonenumber'),
        'phonenumber.string': validationMessagesModule.string('phonenumber'),
        'email.required': validationMessagesModule.required('email'),
        'email.email': validationMessagesModule.email('email'),
        'password.required': validationMessagesModule.required('password'),
        'password.string': validationMessagesModule.string('password'),
        'confirm_password.required':
          validationMessagesModule.required('confirm_password'),
        'confirm_password.string':
          validationMessagesModule.string('confirm_password'),
      }

      const validation = await validate(
        request.all(),
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      const userData = request.only([
        'name',
        'cpf',
        'email',
        'password',
        'confirm_password',
        'phonenumber',
      ])
      const clearCPF = limparCpf(userData.cpf)
      if (clearCPF.length !== 11) {
        return response.status(400).send({
          message: 'O CPF deve ter 11 dígitos, desprezando os símbolos.',
        })
      }

      if (userData.password !== userData.confirm_password) {
        return response.status(400).send({
          message: 'A senha e a confirmação de senha não coincidem',
        })
      }

      const existingEmail = await Producer.findBy('email', userData.email)
      if (existingEmail) {
        return response.status(400).send({
          message: 'Este e-mail pertence a um usuário cadastrado',
        })
      }

      const existingCpf = await Producer.findBy('cpf', clearCPF)
      if (existingCpf) {
        return response.status(400).send({
          message: 'Este CPF pertence a um usuário cadastrado',
        })
      }

      if (userData.phonenumber.length < 11) {
        return response
          .status(400)
          .send({ message: 'Número de telefone inválido.' })
      }

      const hashedPassword = await Hash.make(userData.password)

      const newUser = await Producer.create({
        id: uuidv4(),
        name: userData.name,
        cpf: clearCPF,
        email: userData.email,
        hashed_password: hashedPassword,
        phonenumber: userData.phonenumber,
      })

      const token = await auth.generate({ id: newUser.id })

      return response.status(201).send({
        user_id: newUser.id,
        token: token.token,
      })
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ message: 'Não foi possível finalizar a requisição' })
    }
  }

  /**
   * Autentica um usuário.
   *
   * @function login
   * @description Permite a realização de login, retorna o token de autenticação e o id do usuário.
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {Auth} auth - O objeto de autenticação.
   * @param {string} request.email - O e-mail do usuário.
   * @param {string} request.password - A senha do usuário.
   * @returns {object} Retorna o token de autenticação e o id do usuário logado.
   *
   * @throws {Error} Retorna um erro 400 se a validação dos campos `email` e `password` falhar.
   * @throws {Error} Retorna um erro 401 se o e-mail ou senha forem inválidos.
   * @throws {Error} Retorna um erro 500 se não for possível realizar a requisição.
   */
  async login({ request, response, auth }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const validationRules = {
        email: 'required|email',
        password: 'required|string',
      }

      const validationMessages = {
        'email.required': validationMessagesModule.required('email'),
        'email.email': validationMessagesModule.email('email'),
        'password.required': validationMessagesModule.required('password'),
        'password.string': validationMessagesModule.string('password'),
      }

      const validation = await validate(
        request.all(),
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      const user = await Producer.findBy('email', email)

      if (!user) {
        return response
          .status(401)
          .send({ message: 'E-mail ou senha inválidos' })
      }

      const isPasswordValid = await Hash.verify(password, user.hashed_password)

      if (!isPasswordValid) {
        return response
          .status(401)
          .send({ message: 'E-mail ou senha inválidos' })
      }

      const token = await auth.generate({ id: user.id })

      return response.json({ token: token.token, user_id: user.id })
    } catch (error) {
      console.error(error)
      return response
        .status(500)
        .send({ message: 'Não foi possível realizar a requisição' })
    }
  }

  /**
   * Retorna todos os produtores cadastrados.
   *
   * @function returnAllProducers
   * @description Obtêm todos os produtores registrados
   * @param {Response} response - O objeto de resposta.
   * @returns {object} Retorna todos os produtores registrados
   *
   * @throws {Error} Retorna um erro 500 se houver um erro ao buscar os produtores.
   */
  async returnAllProducers({ response }) {
    try {
      const producers = await Producer.all()
      console.log('Registros de produtores:', producers.toJSON())
      return response.json(producers)
    } catch (error) {
      console.error('Erro ao buscar produtores:', error)
      return response.status(500).json({ error: 'Erro ao buscar produtores' })
    }
  }

  /**
   * Retorna os dados de um usuário específico.
   *
   * @function returnUserData
   * @description Obter os dados de um usuário
   * @param {object} ctx
   * @param {Response} ctx.response - O objeto de resposta.
   * @param {Params} ctx.params - Os parâmetros da requisição.
   * @param {string} ctx.params.user_id - O ID do usuário.
   *
   * @throws {Error} Retorna um erro 400 se o usuário não for encontrado.
   * @throws {Error} Retorna um erro 500 se não for possível finalizar a requisição.
   */
  async returnUserData({ params, response }) {
    try {
      const { user_id } = params
      const user = await Producer.findBy('id', user_id)
      if (!user) {
        return response.status(400).send({ message: 'Usuário não encontrado' })
      }
      return response.json({
        name: user.name,
        cpf: formatarCpf(user.cpf),
        email: user.email,
      })
    } catch (error) {
      return response
        .status(error.status || 500)
        .send([{ message: 'Não foi possível finalizar a requisição.' }])
    }
  }

  /**
   * Atualiza o perfil de um usuário.
   *
   * @function updateProfile
   * @description Atualiza o perfil de um usuário
   * @param {Request} request - O objeto de requisição.
   * @param {Response} response - O objeto de resposta.
   * @param {Params} params - Os parâmetros da requisição.
   * @param {string} params.user_id - O ID do usuário.
   * @param {string} [request.name] - O novo nome do usuário.
   * @param {string} [request.cpf] - O novo CPF do usuário.
   * @param {string} [request.email] - O novo e-mail do usuário.
   * @param {string} [request.password] - A nova senha do usuário.
   * @param {string} [request.confirm_password] - A confirmação da nova senha do usuário.
   * @returns {object} Retorna o status code da alteração
   *
   * @throws {Error} Retorna um erro 400 se a validação dos campos falhar.
   * @throws {Error} Retorna um erro 404 se o usuário não for encontrado.
   * @throws {Error} Retorna um erro 400 se o CPF não tiver 11 dígitos ou se já estiver em uso por outro usuário.
   * @throws {Error} Retorna um erro 500 se não for possível atualizar o perfil.
   */
  async updateProfile({ request, response, params }) {
    const { user_id } = params

    try {
      const { name, cpf, email, password, confirm_password } = request.only([
        'name',
        'cpf',
        'email',
        'password',
        'confirm_password',
      ])

      const validationRules = {
        name: 'string',
        cpf: 'string',
        email: 'email',
        password: 'string',
        confirm_password: 'string',
      }

      const validationMessages = {
        'name.string': validationMessagesModule.string('name'),
        'cpf.string': validationMessagesModule.string('cpf'),
        'email.email': validationMessagesModule.email('email'),
        'password.required': validationMessagesModule.required('password'),
        'password.string': validationMessagesModule.string('password'),
        'confirm_password.required':
          validationMessagesModule.required('confirm_password'),
        'confirm_password.string':
          validationMessagesModule.string('confirm_password'),
      }

      const validation = await validate(
        request.all(),
        validationRules,
        validationMessages
      )

      if (validation.fails()) {
        return response.status(400).send({ message: validation.messages() })
      }

      const user = await Producer.findBy('id', user_id)

      if (!user) {
        return response.status(404).json({ message: 'Usuário não encontrado.' })
      }

      if (cpf) {
        const clearCPF = limparCpf(cpf)

        if (clearCPF.length !== 11) {
          return response.status(400).send({
            message: 'O CPF deve ter 11 dígitos, desprezando os símbolos.',
          })
        }

        // Verifique se o CPF já está em uso
        const existingCpfUser = await Producer.findBy('cpf', clearCPF)
        if (existingCpfUser && existingCpfUser.id !== user.id) {
          return response.status(400).send({
            message: 'Este CPF pertence a outro usuário cadastrado.',
          })
        }

        user.cpf = clearCPF
      }

      if (name) {
        user.name = name
      }

      if (email) {
        // Verifique se o e-mail já está em uso
        const existingEmailUser = await Producer.findBy('email', email)
        if (existingEmailUser && existingEmailUser.id !== user.id) {
          return response.status(400).send({
            message: 'Este e-mail pertence a outro usuário cadastrado.',
          })
        }

        user.email = email
      }

      if (password && confirm_password && password === confirm_password) {
        const hashedPassword = await Hash.make(password)
        user.password = hashedPassword
      }

      await user.save()

      return response.json({ message: 'Perfil atualizado com sucesso' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro ao atualizar o perfil' })
    }
  }
}

module.exports = UserController
