'use strict'
const Route = use('Route')

Route.post('/production-types', 'ProductionTypeController.create').middleware(["auth"])
Route.get('/production-types', 'ProductionTypeController.index').middleware(["auth"])