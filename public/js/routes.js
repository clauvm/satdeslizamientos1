angular.module('deslizamientos')
.config(function($routeProvider){
	$routeProvider.when('/hola', {
		templateUrl: 'template/error.html'
	})
	.when('/', {
		templateUrl: 'template/inicio.html'
	})
	.when('/users', {
		templateUrl: 'template/users/lista.html'
	})
	.when('/addUser', {
		templateUrl: 'template/users/agregar.html'
	})
	.when('/users/:userID/edit', {
		templateUrl: 'template/users/editar.html'
	})
	.when('/users/:userID', { //para ver solo un usuario
		templateUrl: 'template/users/verUser.html'
	})
	.otherwise({redirectTo: '/'});
});