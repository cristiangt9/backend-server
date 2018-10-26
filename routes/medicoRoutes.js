var express = require('express');
var Medico = require('../models/medico');

var mdAutenticacion = require('../middelwares/autenticacion');

var app = express();

// ========================= //
// Obtener medicos
// ==========================//
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre img')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al leer la base de datos',
                    error: err
                });
            }
            Medico.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    mensaje: 'Petición tipo get realizada con exito a medicos',
                    total: count
                });
            });
        })
});
// =============================== //
// Crear medico
// =============================== //

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar en la base de datos',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Hospital creado con exito',
            medico: medicoGuardado
        });

    });
});
// =============================== //
// Actualizar medico por id
// =============================== //

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar en la base de datos',
                error: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con id: ' + id + ' no fue encontrado'
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
        medico.save((err, medicoAcualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar al médico, datos invalidos',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                id: id,
                mensaje: 'Médico de id: ' + id + ' actulizado',
                medico: medicoAcualizado
            });
        });
    });
});
// =============================== //
// Borrar medico por id
// =============================== //

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al conectar con la base de datos',
                error: err
            });
        }
        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con id: ' + id + ' no fue encontrado',
                error: { message: 'No existe ningun medico con ese Id' }
            });
        }
        res.status(200).json({
            ok: true,
            id: id,
            mensaje: 'Médico con id: ' + id + ' eliminado',
            medico: medicoEliminado
        });
    });
});

module.exports = app;