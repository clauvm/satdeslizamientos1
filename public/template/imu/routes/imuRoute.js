angular.module('imu')
.config(function($routeProvider){
	$routeProvider.when('/imu', {
		templateUrl: 'template/imu/views/listar.html'
	});
});