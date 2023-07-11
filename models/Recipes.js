const mongoose = require("mongoose");
const { Schema } = mongoose;

const recipesSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    tolowercase: true,
    required: true,
  },
  // TODO: FALTA TERMINAR EL MODELO.
});

module.exports = mongoose.model("Recipes", recipesSchema);
