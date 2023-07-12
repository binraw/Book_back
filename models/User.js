const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator"); // plugin ajouter
const userSchema = mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // permet un seul utilisateur avec la meme adresse mail
module.exports = mongoose.model("User", userSchema);
