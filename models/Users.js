const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    minLength: 3,
    maxLength: 25,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
    minLength: 5,
    maxLength: 25,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minLength: 7,
    // maxLength: 15,
  },
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Recipes",
    },
  ],
  token: {
    type: String,
    defautl: "",
  },
  accountActivated: {
    type: Number,
    default: 0,
  },
  registered: {
    type: Date,
    default: Date.now(),
  },
});

//* Method to hash password.
userSchema.pre("save", async function (next) {
  // Si el password ya esta hasheado...
  if (!this.isModified("password")) {
    return next();
  }

  // Si no...
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;

  next();
});

module.exports = mongoose.model("User", userSchema);
