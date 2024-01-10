const Route = use('Route')

Route.post('/contact/request', 'ContactController.create').middleware("tokenEquality")
