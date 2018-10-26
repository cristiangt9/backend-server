var express = require('express');
var fileUpload = require('express-fileupload');
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var mdAutenticacion = require('../middelwares/autenticacion');
var fs = require('fs');
var app = express();

app.use(fileUpload());

app.put('/:tipo/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error: No selecciono ningun archivo',
            error: { message: 'Debe seleccionar una imgen' }
        });
    }
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[nombreCortado.length - 1];
    // extenciones permitidas
    var extencionesPermitidas = ['png', 'jpg', 'jpeg', 'gif'];
    var modelosAceptados = ['hospitales', 'usuarios', 'medicos'];

    if (extencionesPermitidas.indexOf(extencionArchivo) > -1) {
        if (modelosAceptados.indexOf(tipo) > -1) {
            var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extencionArchivo}`;
            //mover el archivo
            var path = `./uploads/${ tipo }/${nombreArchivo}`;
            archivo.mv(path, err => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        error: err
                    });
                }
            });
            actualizarImagen(tipo, id, nombreArchivo, res, req);

        } else {
            res.status(400).json({
                ok: false,
                mensaje: 'Error: La tabla ' + tipo + 'no existe',
                error: { message: 'tablas permitidas: ' + modelosAceptados }
            });
        }
    } else {
        res.status(400).json({
            ok: false,
            mensaje: 'Error: Archivo no soportado, debe ser un archico con extención: ' + extencionesPermitidas,
            coincidencias: extencionesPermitidas.indexOf(extencionArchivo)
        });
    }
});

function actualizarImagen(tipo, id, nombreArchivo, res, req) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario con id: ' + id + ' No Existe!!',
                    error: { message: 'No existe ningun usuario con ese Id' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = '******';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Petición realizada con exito',
                    usuario: usuarioActualizado,
                });
            });
        });
    }
    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico con id: ' + id + ' no fue encontrado'
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.usuario = req.usuario._id;
            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = '******';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Petición realizada con exito',
                    medico: medicoActualizado,
                    usuario: req.usuario
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con id: ' + id + ' no fue encontrado'
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.usuario = req.usuario._id;
            hospital.save((err, hospitalActualizado) => {
                hospitalActualizado.password = '******';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Petición realizada con exito',
                    hospital: hospitalActualizado,
                    usuario: req.usuario._id
                });
            });
        });
    }
}

module.exports = app;