#!/bin/env node
//  OpenShift sample Node application
//Cargamos las dependencias
var express = require('express'); //logica del servidor
var fs      = require('fs'); //trabaja con archivos
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var localStrategy = require('passport-local');
var flash = require('connect-flash');
var session = require('express-session');
var moment = require('moment');
var cors = require('cors');
var mqtt = require ('mqtt');
var gcm = require('node-gcm');
//Configuracion de mongoose
var url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
    //utilizamos mongoose para conectarnos a nuestra base de datos mongodb en la nube
    var db = mongoose.connect(url);
//var mongoose = require('./config/mongoose');
//var db = mongoose(); //instanciamos o que se creo en la configuracion de mongoose
/////////////////////////////////////////////////////configurar google cloud message/////////////////////////////////////////////////

var apikey = "AIzaSyDHlXrQJpQgfDMud9X9F2qc9TkXcLHdHxw";
var deviceID = "edPjKt9-Fgg:APA91bEpIj7dX1Ak61wot1LE0KZJ9rpDuuvhRdcWcBj6RryXf-57fm0TlTD6Am-kn9EN4K_UkjATTQZlojsPI6dolmiBcKVZ2-aF98iA6fyS2yNopRSALODnPFva4S60bAxrbZLy6CYj";
var service = new gcm.Sender(apikey);
var message = new gcm.Message();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Schema = mongoose.Schema; // asignar un nuevo esquema 

var UserSchema = new Schema({
    ci : Number,
    nombre : String,
    apellidop : String,
    apellidom : String,
    telefono : Number,
    email : String,
    direccion : String,
    rol : String,
    username : String,
    password : String,
    fnacimiento : String,
    created : {
        type : Date,
        default : Date.now
    }
});
mongoose.model('usuarios', UserSchema); //creamos el modelo y le pasamos ademas el esquema creado
var User = require('mongoose').model('usuarios');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var imu1Schema = new Schema({
    accelx : Number,
    accely : Number,
    accelz : Number,
    gyrox : Number,
    gyroy : Number,
    gyroz : Number,
    created : {
        type : Date,
        default : Date.now
    }
    
});

mongoose.model('imu1', imu1Schema); //creamos el modelo y le pasamos ademas el esquema creado
var imu1 = require('mongoose').model('imu1');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var imu2Schema = new Schema({
    accelx : Number,
    accely : Number,
    accelz : Number,
    gyrox : Number,
    gyroy : Number,
    gyroz : Number,
    created : {
        type : Date,
        default : Date.now
    }
    
});

mongoose.model('imu2', imu2Schema); //creamos el modelo y le pasamos ademas el esquema creado
var imu2 = require('mongoose').model('imu2');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var humSchema = new Schema({
    humedad : Number,
    created : {
        type : Date,
        default : Date.now
    }
});

mongoose.model('hum', humSchema); //creamos el modelo y le pasamos ademas el esquema creado
var hum = require('mongoose').model('hum');



//////////////////////////////////////////////////////////Configurando mqtt//////////////////////////////////////////////////////////////////////////

//para imu1

var clientImu1 = mqtt.connect("tcp://test.mosquitto.org:1883");
clientImu1.on('connect', function () {
     console.log('conectado imu1');
     clientImu1.subscribe('/sat/imu/1');
});

clientImu1.on('message', function (topic, message) {

    var hola = message.toString();

    var separa = hola.split(';');


     var senImu1 = new imu1({
        accelx : separa[0],
        accely : separa[1],
        accelz : separa[2],
        gyrox : separa[3],
        gyroy : separa[4],
        gyroz : separa[5]
     });

     senImu1.save(function (err) {
          if(err){
            console.log(err);
          }
          else{
            console.log(senImu1);
          }
     });
});

//para imu2
var clientImu2 = mqtt.connect("tcp://test.mosquitto.org:1883");
clientImu2.on('connect', function () {
     console.log('conectado imu2');
     clientImu2.subscribe('/sat/imu/2');
});

clientImu2.on('message', function (topic, message) {

    var hola = message.toString();

    var separa = hola.split(";");


     var senImu2 = new imu2({
        accelx : separa[0] ,
        accely : separa[1],
        accelz : separa[2],
        gyrox : separa[3],
        gyroy : separa[4],
        gyroz : separa[5]
     });

     senImu2.save(function (err) {
          if(err){
            console.log(err);
          }
          else{
            console.log(senImu2);
          }
     });

});

//para humedad
var clientHumedad = mqtt.connect("tcp://test.mosquitto.org:1883");
clientHumedad.on('connect', function () {
     console.log('conectado humedad');
     clientHumedad.subscribe('/sat/humedad');
});

clientHumedad.on('message', function (topic, message) {

     var senHumedad = new hum({
        humedad: message
     });

     senHumedad.save(function (err) {
          if(err){
            console.log(err);
          }
          else{
            console.log(senHumedad);
          }
     });

     if(message==120){
        var messageHumedad = new gcm.Message();
        messageHumedad.addData('title', 'Alerta de humedad');
        messageHumedad.addData('message', "humedad recibida de:"+message);
        messageHumedad.addData('image', 'twitter');
        service.send(messageHumedad, { registrationTokens: [deviceID]}, function (err, response) {
             if(err){
                console.log(err);
             }
             else{
                console.log(response);
             }
        });
     }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//configuracion de passport
passport.use(new localStrategy(function (username, password, done){
    //find one para encontrar un usuario
    User.findOne({username:username}, function (err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: "usuario incorrecto"});
        }
        if(user.password!=password){
            return done(null, false, {message: "password incorrecto"});
        }
        return done(null, user);
    });
}));

//funciones para password
passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findOne({_id:id}, '-password', function(err, user){
        done(err, user);
    });
});
/**
 *  Define the sample application.
 */
var SampleApp = function() { 

    //  Scope.
    var self = this; //alcanca


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP; //es una variable de entorno, variables de configuracion de openshift
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() { 
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };


    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */

     //A partir de aca basicamente se hace todo el trabajo del servidor
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express(); //se queda asi  por la nueva version de 

        //cargamos las views ejs
        self.app.set("views", "appserver/views"); //explica en que directorio estaran ;as vistas
        self.app.set("view engine", "ejs"); //motor de vistas s ejs

        self.app.use(session({
        saveUninitialized: true,
        resave : true,
        secret : '<mysecret>'
        }));

        //Le decimos a express que los archivos estaticos estaran en una carpeta llamada public
        self.app.use(express.static('public')); 
        self.app.use(bodyParser.urlencoded({
        extended : true
        }));
        self.app.use(bodyParser.json());
        self.app.use(methodOverride());
        //cargamos flash
        self.app.use(flash());
        self.app.use(passport.initialize());
        self.app.use(passport.session());
        self.app.use(cors());

        //manejod de rutas 
        // self.app.get("/", function(req, res){
        //     res.send("Hola mundo");
        // });

        //probando rutas con ejs
        self.app.get("/", function(req, res){
            res.render("login", { //con ""laves se pasa variable json
                title: "SAT para deslizamientos" ,
                // usuario:JSON.stringify(req.user),
                 messages: req.flash('error') || req.flash('info')
                // usuariop: req.user
            }); //no hay necesidad de poner la extension
        });

        self.app.get("/imu", function(req, res){
            res.render("imu", { //con ""laves se pasa variable json
                title: "Grafica estado IMU" 
                // usuariop: req.user
            }); //no hay necesidad de poner la extension
        });

        self.app.get("/humedad", function(req, res){
            res.render("humedad", { //con ""laves se pasa variable json
                title: "Grafica estado sensor de humedad" 
                // usuariop: req.user
            }); //no hay necesidad de poner la extension
        });

        self.app.get("/index", function(req, res){
            res.render("index", { //con ""laves se pasa variable json
                title: "SAT para deslizamientos", 
                usuario:JSON.stringify(req.user),
                //messages: req.flash('error') || req.flash('info'),
                usuariop: req.user
            }); //no hay necesidad de poner la extension
        });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //APIs Mongoose
        self.app.get('/users',function (req,res) {
           User.find({},function(err,users){
            if(err){
                return next(err);
            }
            else{
                res.json(users);
            }
           }) 
        });
        self.app.post('/users', function (req,res,next){
            var user = new User(req.body);
            user.save(function(err){
                if(err){
                    return next(err);
                }
                else{
                    res.json(user);
                }
            });
        });
        //manipular un usuario por su id, llamar al user
        self.app.get('/users/:userID', function (req,res){
            //moment("12-25-1995", "MM-DD-YYYY");
            res.json(req.user);
        });

        //hacer el update
        self.app.put('/users/:userID', function (req,res,next){
            /*User.findByIdAndUpdate(req.user.id, req.body, function (err,user){
                if(err){
                    return next(err);
                }
                else{
                    res.json(user); //para notar que se ha actualizado
                }
            });*/
            var user = req.user;
            //Actualizar los campos del Uusario
            user.ci = req.body.ci;
            user.nombre = req.body.nombre;
            user.apellidop = req.body.apellidop;
            user.apellidom = req.body.apellidom;
            user.telefono = req.body.telefono;
            user.email = req.body.email;
            user.direccion = req.body.direccion;
            user.rol = req.body.rol;
            user.username = req.body.username;
            user.password = req.body.password;
            user.fnacimiento = req.body.fnacimiento;


             //Intentar salvar el articulo actualizado
            user.save(function (err) {
            if(err){
                return res.status(400).send({
                    message : getErrorMessage(err)
                });
            }else{
                res.json(user);
            }
            });
        });

        //haciendo el delete
        self.app.delete('/users/:userID', function (req,res,next){ //:userID es un parametro
            req.user.remove(function (err){
                if(err){
                    return next(err);
                }
                else{
                    res.json(req.user);
                }
            });
        });

        //agarrar el id como parametro  y que lo encuentre en la bd
        self.app.param('userID', function (req,res,next,id){ //cada vez que encuentre userID hara algo
            User.findOne({_id:id}, function (err,user){
                if(err){
                    return next(err);
                }
                else{
                    req.user=user;
                    next();
                }
            });
        });

        self.app.post('/login', passport.authenticate('local', {
            successRedirect:'/index', failureRedirect:'/', failureFlash: true
        }));

        self.app.get('/error', function(req, res){
            res.render("error", { //con ""laves se pasa variable json
                title: "Error"//,  messages: req.flash('error') || req.flash('info')
            }); //no hay necesidad de poner la extension
        });

        self.app.get('/logout', function(req, res){
            req.logout();
            res.redirect('/');
        });
        //para autenticacion usuarios
        //Le decimos a express que el parametro 'userID' sera el id de passport y que utilice el metodo findOne para encontrarlo
        self.app.param('userID', function (req, res, next ,id) {
         User.findOne({
        _id : id
        },function (err,user) {
         if(err){
            return next(err);
         }else{
            req.user = user;
            next();
         }
         });
        });

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    
    //  Start the server (starts up the sample application).
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */




/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

