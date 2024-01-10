'use strict'
const Route = use('Route')

Route.post('/production-types', 'ProductionTypeController.create').middleware("tokenEquality")
