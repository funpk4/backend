const mongoose = require('mongoose')


const formSchema = new mongoose.Schema({
    adminId: { type: mongoose.SchemaTypes.ObjectId, ref:'admin' },
    field1: { type: String, default: '' },
    field1: { type: String, default: '' },
    field1: { type: String, default: '' },

    

});


module.exports = mongoose.model('form', formSchema)