'use strict'
// Rotas para as produções
const Route = use('Route')

Route.post('/production/create/:user_id', 'ProductionController.createProduction').middleware(["tokenEquality", "auth"])
Route.get('/production/:production_id', 'ProductionController.getProduction').middleware(["auth"])
Route.get('/productions', 'ProductionController.getProductionsList').middleware(["auth"])
Route.patch('/production/:production_id', 'ProductionController.updateProduction').middleware(["auth"])

Route.get('/productions/:user_id', 'ProductionController.getMyProductionsList').middleware(["tokenEquality", "auth"])

Route.get('/productions/type/:production_type_value', 'ProductionController.searchForProductionByType').middleware(["auth"])