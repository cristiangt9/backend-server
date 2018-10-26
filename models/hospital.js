var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false, default: null },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

// usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe de ser único' })

module.exports = mongoose.model('Hospital', hospitalSchema);