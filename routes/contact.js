const Route = use('Route')

Route.post('/contact/request', 'ContactController.create').middleware(["auth"])
Route.get('/contacts', 'ContactController.index').middleware(["auth"])