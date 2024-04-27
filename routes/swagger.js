'use strict'
const View = use('View');
const Route = use('Route');

// Rota para o Swagger UI
Route.get('/docs', 'SwaggerController.show').prefix('api');

// Rota para servir o arquivo swagger.json
Route.get('/swagger.json', 'SwaggerController.getJson');
