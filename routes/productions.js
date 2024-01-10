'use strict'
// Rotas para as produções
const Route = use('Route')

Route.post('/production/create/:user_id', 'ProductionController.createProduction').middleware("tokenEquality")
Route.get('/production/:production_id', 'ProductionController.getProduction').middleware("tokenEquality")
Route.get('/productions', 'ProductionController.getProductionsList').middleware("tokenEquality")
Route.patch('/production/:production_id', 'ProductionController.updateProduction').middleware("tokenEquality")

Route.get('/productions/:user_id', 'ProductionController.getMyProductionsList').middleware("tokenEquality")

Route.get('/productions/type/:production_type_value', 'ProductionController.searchForProductionByType').middleware("tokenEquality")