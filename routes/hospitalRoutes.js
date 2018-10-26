var express = require('express');
var Hospital = require('../models/hospital');

var mdAutenticacion = require('../middelwares/autenticacion');

var app = express();

// ========================= //
// Obtener hospitales
// ==========================//
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al leer la base de datos',
                    error: err
                });
            }
            Hospital.count({}, (err, count) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    mensaje: 'Petición tipo get realizada con exito a hospitales',
                    total: count
                });
            });
        });
});
// =============================== //
// Crear hospital
// =============================== //

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
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
            hospital: hospitalGuardado
        });

    });
});

// =============================== //
// Actualizar hopital por id
// =============================== //

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar en la base de datos',
                error: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id: ' + id + ' no fue encontrado'
            });
        }
        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalAcualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital, datos invalidos',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                id: id,
                mensaje: 'hospital de id: ' + id + ' actulizado',
                hospital: hospitalAcualizado
            });
        })
    });
});

// =============================== //
// Borrar hospital por id
// =============================== //

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al conectar con la base de datos',
                error: err
            });
        }
        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id: ' + id + ' no fue encontrado',
                error: { message: 'No existe ningun hospital con ese Id' }
            });
        }
        res.status(200).json({
            ok: true,
            id: id,
            mensaje: 'Hospital con id: ' + id + ' eliminado',
            hospital: hospitalEliminado
        });
    });
});
module.exports = app;