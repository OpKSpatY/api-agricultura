'use strict'
// Rotas para o usuário
const Route = use('Route')

Route.post('/reset-password', 'AuthController.resetPassword')