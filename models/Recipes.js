const mongoose = require("mongoose");
const { Schema } = mongoose;

const recipesSchema = new Schema({
  name: {
    type: String,
    trim: true,
    tolowercase: true,
    required: true,
  },
  ingredients: [
    {
      type: String,
      tolowercase: true,
      required: true,
      trim: true,
      minLength: 2,
    },
  ],
  procedure: {
    type: String,
    tolowercase: true,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Recipes", recipesSchema);
