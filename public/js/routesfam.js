angular.module('familias')
.config(function ($routeProvider){
	$routeProvider.when('/families', {
		templateUrl: 'template/familias/lista.html'
	})
	.when('/addFam', {
		templateUrl: 'template/familias/agregar.html'
	})
	.when('/families/:familyID', {
		templateUrl: 'template/familias/verFam.html'
	})
	.when('/families/:familyID/edit', {
		templateUrl: 'template/familias/editar.html'
	})
	.otherwise({redirectTo: '/'});
});