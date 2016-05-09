(function(){
var app = angular.module("deslizamientos", ['ngRoute', 'ngResource', 'familias', 'imu']);

app.factory('Authentication', [
  function(){
    this.usuario = {};
    if(window.usuario){
      this.usuario = window.usuario;
    }
   
  return {
   usuario : this.usuario
   
  };
 }]);

app.factory('Users', ['$resource', function($resource){
  return $resource('/users/:userID', {userID:'@_id'}, {update:{method:'PUT'}});
}])
/*app.factory('Authentication', function($window){
	return{
		usuario: nunction
	}
});*/


app.controller('usuariosCtrl', ['$http', '$scope', '$location', '$routeParams', 'Authentication', 'Users', function($http, $scope, $location, $routeParams, Authentication, Users){
	  //var users = this;
    //users = []
    $scope.authentication = Authentication;

    $scope.create=function(){
      var h;
      var user = new Users({
          ci : this.ci, 
          nombre : this.nombre,
          apellidop : this.apellidop,
          apellidom : this.apellidom,
          direccion : this.direccion,
          email : this.email,
          telefono : this.telefono,
          fnacimiento : moment(this.fnacimiento).format('DD-MM-YYYY'),
          username : this.username,
          password : this.password,
          rol : this.rol
      });
      user.$save(function (response){
          $location.path('users/'+ response._id);
      },
      function (errorResponse){
          $scope.error = errorResponse.data.message;
      }
      );
    };

    $scope.find=function () {
       $scope.users=Users.query();
    };

    $scope.findOne=function () {
       $scope.user=Users.get({userID : $routeParams.userID});
      //  var m = moment($scope.user.fnacimiento).format('DD/MM/YYYY');
      //  $scope.user.nombre="hola";
       
      // $scope.user.fnacimiento=moment($scope.user.fnacimiento).format('DD/MM/YYYY');
      //  console.log($scope.user.fnacimiento);
      //  console.log(m);
      //  console.log($scope.user.nombre);
    };

    $scope.update=function () {

         //moment($scope.user.fnacimiento).format('DD/MM/YYYY'); 
        $scope.user.$update(function () {
           $location.path('users/'+ $scope.user._id);
        },
        function (errorResponse) {
          $scope.error = errorRespnse.data.message;
        });
    };

    $scope.delete = function (user) {
       if(user){
        if (confirm("Esta seguro que desea eliminar al usuario?")==true) {
        //Usar el emtodo $remove de user para borrar el usuario
        user.$remove(function () {
           $location.path('users');
        });
        }
       }
       else{
        if (confirm("Esta seguro que desea eliminar al usuario?")==true) {
        //En otro caso, usar el metodo '$remove' de user para borrar el usuario (Es decir si se elimina el usuario de la propia pagina)
        $scope.user.$remove(function () {
          $location.path('users');
        });
       }
     }
    };

    $scope.roles=["admi", "sec"];



}]);


})();