var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middelwares/autenticacion');


var app = express();

// ========================= //
// Verificar token           //
// ==========================//

// app.use('/', (req, res, next) => {
//     var token = req.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 error: err
//             });
//         }
//         next();
//     })
// });

// ========================= //
// Obtener todos los usuarios//
// ==========================//

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos',
                    error: err
                });
            }
            Usuario.count({}, (err, count) => {

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: count
                });
            });
        });
});
// ========================= //
// Crear un nuevo Usuario    //
// ==========================//
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                error: err
            });
        }
        usuarioGuardado.password = '*******';
        res.status(200).json({
            ok: true,
            usuarios: usuarioGuardado,
            usuarioSolicitador: req.usuario
        });

    });
});
// ============================ //
// Actualizar un nuevo Usuario //
// ============================//

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
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
                mensaje: 'Usuario con id: ' + id + ' No Existe!!',
                error: { message: 'No existe ningun usuario con ese Id' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    error: err
                });
            }
            usuarioGuardado.password = '*******';
            res.status(202).json({
                ok: true,
                mensaje: 'usuario de id: ' + id + ' actulizado',
                usuarios: usuarioGuardado
            });
        });
    });
});

// ============================ //
// Eliminar un Usuario por el id//
// ============================//

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario con id: ' + id + ' No Existe!!',
                error: { message: 'No existe ningun usuario con ese Id' }
            });
        }
        res.status(202).json({
            ok: true,
            mensaje: 'Usuariocon id: ' + id + ' eliminado',
            usuarios: usuario
        });
    });
});

module.exports = app;