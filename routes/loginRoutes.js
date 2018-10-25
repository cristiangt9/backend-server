var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

app.post('/', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                error: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - password',
                error: err
            });
        }
        // crar token
        usuario.password = '*******';
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });
        res.status(200).json({
            ok: true,
            menssage: 'Bienvenido!!',
            token: token,
            usuario: usuario
        });
    });
});


module.exports = app;