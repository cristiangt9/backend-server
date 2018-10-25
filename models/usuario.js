var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    massage: '{VALUE} no se un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo electrónico es necesario'] },
    password: { type: String, required: [true, 'El contraseña es necesario'] },
    img: { type: String, required: false, default: null },
    role: { type: String, required: [true, 'El rolw es necesario'], default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe de ser único' })

module.exports = mongoose.model('Usuario', usuarioSchema);