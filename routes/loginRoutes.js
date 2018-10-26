var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

var app = express();

// =============================== //
// Autenticacion Normal
// =============================== //
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

// =============================== //
// Autenticacion con google
// =============================== //
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch(err => {
        res.status(403).json({
            ok: true,
            menssage: 'Token no valido'
        });
    });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                error: err
            });
        }
        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                });
            } else {
                // crar token
                usuarioDB.password = '*******';
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    menssage: 'Bienvenido!!',
                    token: token,
                    usuario: usuarioDB
                });
            }
        } else {
            // el usuario no existe... hay que crealo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre || 'nombre por definir';
            usuario.email = googleUser.email;
            usuario.img = googleUser.img || null;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al guardar usuario',
                        err
                    });
                }
                usuarioGuardado.password = '*******';
                var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 });
                return res.status(200).json({
                    ok: true,
                    menssage: 'Usuario creado Bienvenido!!',
                    token: token,
                    usuario: usuarioGuardado
                });
            })
        }
    });
    // res.status(200).json({
    //     ok: true,
    //     menssage: 'Bienvenido!!',
    //     googleUser: googleUser
    // });
});

module.exports = app;