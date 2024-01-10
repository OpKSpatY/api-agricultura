'use strict'
// Rotas para o usuário
const Route = use('Route')

//Route.get('/users', 'UserController.returnAllProducers')
Route.post('/register', 'UserController.createUser')
Route.post('/login', 'UserController.login')

Route.get('/user-data/:user_id', 'UserController.returnUserData').middleware("tokenEquality")
Route.patch('/user-data/:user_id', 'UserController.updateProfile').middleware("tokenEquality")