'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Env = use('Env')
const jwt = require('jsonwebtoken')

class TokenEquality {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Function} next
   */
  async handle({ request, response, params }, next) {
    const { user_id: userID } = params
    const token = request.header('authorization')

    if (!token) {
      return response.status(403).send([{ message: 'Token não informado.' }])
    }

    const hashToken = token.substring(token.indexOf(' ')).trim()

    const decoded = jwt.verify(hashToken, Env.get('APP_KEY'))

    if (decoded.uid !== userID)
      return response.status(403).send([{ message: 'Usuário não autorizado!' }])

    await next()
  }
}

module.exports = TokenEquality
