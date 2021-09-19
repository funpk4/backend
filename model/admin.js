const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({

	full_name: {type: String, default: ''},
	email: {type: String, unique: true},
  role_type: {type: String, default:''},
	password: {type: String},
	token: {type: String},

  
});


/*adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});*/

module.exports = mongoose.model('admin', adminSchema)