var mongoose = require('mongoose');
var Schema = mongoose.Schema; // asignar un nuevo esquema 

var UserSchema = new Schema({
	nombre : String,
	apellidos : String,
	telefono : String,
	email : String,
	direccion : String,
	rol : String,
	username : String,
	password : String,
	fnacimiento : String

});
mongoose.model('User', UserSchema); //creamos el modelo y le pasamos ademas el esquema creado