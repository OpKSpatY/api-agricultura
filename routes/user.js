'use strict'
// Rotas para o usuário
const Route = use('Route')

Route.post('/register', 'UserController.createUser')
Route.post('/login', 'UserController.login')

Route.get('/user-data/:user_id', 'UserController.returnUserData').middleware(["tokenEquality", "auth"])
Route.patch('/user-data/:user_id', 'UserController.updateProfile').middleware(["tokenEquality", "auth"])