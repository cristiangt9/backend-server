// Requires 
var express = require('express');
var mongoose = require('mongoose');
var bodyParse = require('body-parser');
// importando rutas
var appRoutes = require('./routes/appRoutes');
var usuarioRoutes = require('./routes/usuarioRoutes');
var loginRoutes = require('./routes/loginRoutes');
// Inicializar variables 

var app = express();

// Body parse

app.use(bodyParse.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParse.json());

// Conexion a la base de datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Base de Datos puerto 27017: \x1b[32m%s\x1b[0m', 'online');

});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);
app.use('/login', loginRoutes);

// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express serve puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
// Colores para la consola

// Reset = "\x1b[0m" Bright = "\x1b[1m" Dim = "\x1b[2m"
// Underscore = "\x1b[4m" Blink = "\x1b[5m" Reverse = "\x1b[7m" Hidden = "\x1b[8m"
// FgBlack = "\x1b[30m" FgRed = "\x1b[31m" FgGreen = "\x1b[32m" FgYellow = "\x1b[33m" FgBlue = "\x1b[34m" FgMagenta = "\x1b[35m"
//FgCyan = "\x1b[36m" FgWhite = "\x1b[37m" BgBlack = "\x1b[40m" BgRed = "\x1b[41m" BgGreen = "\x1b[42m"BgYellow = "\x1b[43m" 
//BgBlue = "\x1b[44m" BgMagenta = "\x1b[45m" BgCyan = "\x1b[46m" BgWhite = "\x1b[47m"