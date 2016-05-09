//estara toda la configuracion de mongoose

//cargando las dependencias del modulo
//var config = require('./env/development');
var mongoose = require('mongoose');

//definiendo metodo de configuracion
module.exports = function(){
	var url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
	//utilizamos mongoose para conectarnos a nuestra base de datos mongodb en la nube
	var db = mongoose.connect(url);
	//cargamos el modelo creado
	//require('../appserver/models/user.server.model');

	return db;

}