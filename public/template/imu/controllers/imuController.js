angular.module('imu')
.controller('imuController', ['$scope', function ($scope) {
	    var client = new Messaging.Client("test.mosquitto.org", 8080, "myclientid_" + parseInt(Math.random() * 100, 10));
 console.log("en lista");
//Connect Options
 var options = {
     timeout: 3,
     //Gets Called if the connection has sucessfully been established
     onSuccess: function () {
         //alert("Connected");
          $('#estado').text('Conectado');
         client.subscribe('/prueba/server', {qos: 2});
         console.log("conectado!")
     },
     //Gets Called if the connection could not be established
     onFailure: function (message) {
        $('#estado').text('Error de conexion:');
        conectar();
        // alert("Connection failed: " + message.errorMessage);
     }
 };
 client.connect(options);
function conectar () {
     client.connect(options);
}
function erase(){
    $('#messages').empty();

}

 //Gets  called if the websocket/mqtt connection gets disconnected for any reason
 client.onConnectionLost = function (responseObject) {
     //Depending on your scenario you could implement a reconnect logic here
      $('#messages').empty();
      $('#estado').text('Desconectado');
     //alert("connection lost: " + responseObject.errorMessage)

 };

 //Gets called whenever you receive a message for your subscriptions
 client.onMessageArrived = function (message) {
     //Do something with the push message you received
     $('#messages').append('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
 }; 
}]);