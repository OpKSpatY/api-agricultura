'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Auth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, response, auth }, next) {
    const token = request.header('Authorization')

    if (!token) {
      return response.status(401).json({ error: 'Token não fornecido' })
    }

    try {
      // Verifique o token usando a mesma lógica usada para assiná-lo
      const decoded = jwt.verify(token, Env.get('APP_KEY'))

      // Atribua o usuário autenticado ao contexto
      auth.user = decoded

      // Continue com a próxima etapa da solicitação
      await next()
    } catch (error) {
      return response.status(401).json({ error: 'Token inválido' })
    }
  }
}

module.exports = Auth
