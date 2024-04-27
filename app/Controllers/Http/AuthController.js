// app/Controllers/Http/AuthController.js

'use strict'

const Producer = use('App/Models/Producer')
const Mail = use('Mail')
const Env = use('Env')
const Hash = use('Hash')
const crypto = require('crypto')

class AuthController {
  async showResetForm({ view }) {
    return view.render('auth.reset')
  }

  async sendResetLink({ request, response, session }) {
    // Função incompleta, falta integração com SMTP
    try {
      const email = request.input('email')
      const user = await Producer.findBy('email', email)

      if (!user) {
        session.flash({ error: 'E-mail não encontrado.' })
        return response.redirect('back')
      }

      const token = crypto.randomBytes(10).toString('hex')
      user.reset_token = token
      user.reset_token_expiration = new Date(new Date().getTime() + 30 * 60000) // Token válido por 30 minutos
      await user.save()

      const resetUrl = `${Env.get('APP_URL')}/password/reset/${token}`

      await Mail.send('emails.reset', { user, resetUrl }, (message) => {
        message
          .to(user.email)
          .from(Env.get('MAIL_USERNAME'))
          .subject('Reset de Senha')
      })

      session.flash({ success: 'E-mail de recuperação enviado com sucesso.' })
      return response.redirect('back')
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Erro ao enviar o e-mail de recuperação.' })
      return response.redirect('back')
    }
  }

  async showResetPasswordForm({ params, view }) {
    return view.render('auth.resetPassword', { token: params.token })
  }

  async resetPassword({ request, response, session }) {
    // Função incompleta, falta integração com SMTP
    try {
      const token = request.input('token')
      const password = request.input('password')
      const user = await Producer.findBy('reset_token', token)

      if (!user || new Date() > user.reset_token_expiration) {
        session.flash({ error: 'Token de recuperação inválido ou expirado.' })
        return response.redirect('back')
      }

      user.hashed_password = await Hash.make(password)
      user.reset_token = null
      user.reset_token_expiration = null
      await user.save()

      session.flash({ success: 'Senha resetada com sucesso.' })
      return response.redirect('/')
    } catch (error) {
      console.error(error)
      session.flash({ error: 'Erro ao resetar a senha.' })
      return response.redirect('back')
    }
  }
}

module.exports = AuthController
