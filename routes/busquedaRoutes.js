var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// =============================== //
// Busqueda general
// =============================== //

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            totalHospitales: respuestas[0].length,
            medicos: respuestas[1],
            totalMedicos: respuestas[1].length,
            usuarios: respuestas[2],
            totalUsuarios: respuestas[2].length,
            mensaje: 'Petición realizada con exito'

        });
    });
});

// =============================== //
// Busqueda por coleccion
// =============================== //
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {

        if (tabla === 'medicos') {
            res.status(200).json({
                ok: true,
                medicos: respuestas[1],
                totalMedicos: respuestas[1].length,
                mensaje: 'Petición realizada con exito'
            });
        } else if (tabla === 'hospitales') {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                totalHospitales: respuestas[0].length,
                mensaje: 'Petición realizada con exito'
            });
        } else if (tabla === 'usuarios') {
            res.status(200).json({
                ok: true,
                usuarios: respuestas[2],
                totalUsuarios: respuestas[2].length,
                mensaje: 'Petición realizada con exito'
            });
        } else {
            res.status(400).json({
                ok: false,
                mensaje: 'Error: los tipos de busqueda solo pueden ser en usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });
        }
    });
});

// =============================== //
// Busqueda de medicos
// =============================== //
app.get('/medico/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarMedicos(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                medicos: respuestas[0],
                totalMedicos: respuestas[0].length,
                mensaje: 'Petición realizada con exito'

            });
        });
});


function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email img role').or({ nombre: regex }, { email: regex })
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}
module.exports = app;