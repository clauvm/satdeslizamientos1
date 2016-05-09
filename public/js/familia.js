(function () {
	 var app = angular.module('familias', []);
     //devuelve la configuracion para ngResource
	 app.factory('Families',['$resource', function ($resource) {
   		return $resource('/families/:familyID', {familyID : '@_id'}, {update :{method:'PUT'}});
 	}]);


	 //inyectando en el controller
	 app.controller('familiesCtrl', ['$http', '$scope', '$location', '$routeParams', 'Families', function($http, $scope, $location, $routeParams, Families){

    $scope.create=function(){
      var family = new Families({
          // ci : this.ci, 
          // nombre : this.nombre,
          // apellidop : this.apellidop,
          // apellidom : this.apellidom,
          // direccion : this.direccion,
          // email : this.email,
          // telefono : this.telefono,
          // fnacimiento : this.fnacimiento,
          // username : this.username,
          // password : this.password,
          // rol : this.rol
      });
      family.$save(function (response){
          $location.path('families/'+ response._id);
      },
      function (errorResponse){
          $scope.error = errorResponse.data.message;
      }
      );
    };

    $scope.find=function () {
       $scope.families=Families.query();
    };

    $scope.findOne=function () {
       $scope.family=Families.get({familyID : $routeParams.familyID});
    };

    $scope.update=function () {
        $scope.family.$update(function () {
           $location.path('families/'+ $scope.family._id);
        },
        function (errorResponse) {
          $scope.error = errorRespnse.data.message;
        });
    };

    $scope.delete = function (family) {
       if(family){
        if (confirm("Esta seguro que desea eliminar esta familia?")==true) {
        //Usar el emtodo $remove de user para borrar el usuario
        family.$remove(function () {
           $location.path('families');
        });
        }
       }
       else{
        if (confirm("Esta seguro que desea eliminar a esta familia?")==true) {
        //En otro caso, usar el metodo '$remove' de user para borrar el usuario (Es decir si se elimina el usuario de la propia pagina)
        $scope.family.$remove(function () {
          $location.path('families');
        });
       }
     }
    };

}]);

	
})();