const UserModel = require("../models/Users");
const RecipesModel = require("../models/Recipes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const shortId = require("shortid");
const path = require("path");
const { unlink } = require("node:fs/promises");

const {
  changePasswordEmail,
  confirmYourAccount,
} = require("../helpers/mailtrap");

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userSaved = await UserModel.findOne({ email });

    //* Check if user already exists
    if (!userSaved) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    //* Check if password is correct
    if (!(await bcrypt.compare(password, userSaved.password))) {
      return res.status(400).json({ msg: "Password Incorrecto" });
    }

    if (userSaved.accountActivated === 0) {
      return res
        .status(403)
        .json({ msg: "Activa Tu Cuenta Para Iniciar Sesión" });
    }

    const token = jwt.sign(
      { id: userSaved._id.toString(), email: userSaved.email },
      process.env.SECRET_KEY,
      { expiresIn: "60d" }
    );
    return res.status(200).json({ msg: "Autenticaión Correcta", token });
  } catch (error) {
    return res.status(400).json({ msg: `Ocurrió un error: ${error.message}` });
  }
};

const signUp = async (req, res) => {
  try {
    const emailValidation = new RegExp(
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "g"
    );
    const firstNameValidation = new RegExp(/^[a-zA-Z]{3,25}$/);
    const lastNameValidation = new RegExp(/^[a-zA-Z]{3,25}$/);
    const passwordValidation = new RegExp(/^([a-zA-Z0-9]){7,15}$/);

    if (!firstNameValidation.test(req.body.firstName)) {
      return res.status(400).json({ msg: "El NOMBRE es inválido" });
    }
    if (!lastNameValidation.test(req.body.lastName)) {
      return res.status(400).json({ msg: "El APELLIDO es inválido" });
    }
    if (!emailValidation.test(req.body.email)) {
      return res.status(400).json({ msg: "El EMAIL es inválido" });
    }
    if (!passwordValidation.test(req.body.password)) {
      return res.status(400).json({ msg: "El PASSWORD es inválido" });
    }

    //* Save user
    const userSaved = await UserModel.create(req.body);

    //* ENVIAR EMAIL DE CONFIRMACIÓN DE CUENTA Y ACTUALIZAR EL TOKEN
    const token = shortId.generate();
    confirmYourAccount({ email: userSaved.email, token });
    userSaved.token = token;
    await userSaved.save();

    return res
      .status(200)
      .json({ msg: "Registro Exitoso - Confirma Tu Cuenta" });
  } catch (error) {
    const arrayErrors = [];

    //! SHOW ERRORES.
    if (error.errors) {
      error.errors.firstName?.properties.type === "minlength" &&
        arrayErrors.push("El NOMBRE es muy corto");
      error.errors.lastName?.properties.type === "minlength" &&
        arrayErrors.push("El APELLIDO es muy corto");
      error.errors.password?.properties.type === "minlength" &&
        arrayErrors.push("El PASSWORD es muy corto");

      error.errors.firstName?.properties.type === "maxlength" &&
        arrayErrors.push("El NOMBRE es muy corto");
      error.errors.lastName?.properties.type === "maxlength" &&
        arrayErrors.push("El APELLIDO es muy corto");

      error.errors.firstName?.properties.type === "required" &&
        arrayErrors.push("El NOMBRE es obligatorio");
      error.errors.lastName?.properties.type === "required" &&
        arrayErrors.push("El APELLIDO es obligatorio");
      error.errors.password?.properties.type === "required" &&
        arrayErrors.push("El PASSWORD es obligatorio");
      error.errors.email?.properties.type === "required" &&
        arrayErrors.push("El EMAIL es obligatorio");
    }

    error.code === 11000 && arrayErrors.push("El EMAIL ya está registrado");

    console.log(error);
    return res.status(400).json({ msg: arrayErrors });
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    const { email } = req.body;

    const userFound = await UserModel.findOne({ email });

    if (!userFound || userFound.length === 0) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    const recipes = await RecipesModel.find({ userId: userFound._id });
    const imagesRecipes = [];

    for (const recipe of recipes) {
      if (recipe.picture) {
        imagesRecipes.push(recipe.picture);
      }
    }

    if (imagesRecipes.length > 0) {
      imagesRecipes.map(async (imageState) => {
        const url = path.join(__dirname, `/../public/img/${imageState}`);
        await unlink(url);
      });
    }
    await RecipesModel.deleteMany({ userId: userFound._id });
    await userFound.deleteOne();

    return res.status(200).json({ msg: "Usuario eliminado correctamente" });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha Ocurrido un error: ${error.message}` });
  }
};

const editMyAccount = async (req, res) => {
  try {
    const { id, firstName, lastName, password } = req.body;

    const userExists = await UserModel.findById(id);

    if (!userExists) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (firstName) {
      userExists.firstName = firstName;
    }

    if (lastName) {
      userExists.lastName = lastName;
    }

    if (password) {
      userExists.password = password;
    }

    await userExists.save();

    return res
      .status(200)
      .json({ msg: "Tus datos se han actualizado correctamente" });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha Ocurrido un error: ${error.message}` });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const userFound = await UserModel.findOne({ email: req.body.email });
    if (!userFound) {
      return res.status(404).json({ msg: "El correo no existe" });
    }

    const token = shortId.generate();
    const { _id, firstName, lastName, email } = userFound;

    //* Update token
    await UserModel.findOneAndUpdate({ _id }, { token }, { new: true });

    //* Send email
    changePasswordEmail({
      firstName,
      lastName,
      email,
      token,
    });

    res.status(200).json({
      msg: "Te hemos enviado un correo con las insstruciones para recuperar tu password",
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ msg: "Ha ocurrido un error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenExists = await UserModel.findOne({ token });
    if (!tokenExists) {
      return res.status(404).json({ msg: "No se ha encontrado el usuario" });
    }

    const hash = await bcrypt.hash(password, 12);

    await UserModel.findOneAndUpdate(
      { _id: tokenExists._id },
      { token: "", password: hash },
      { new: true }
    );

    return res
      .status(200)
      .json({ msg: "La contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ msg: "Ha ocurrido un error" + error });
  }
};

const confirmAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const tokenExists = await UserModel.findOne({ token });
    if (!tokenExists) {
      return res.status(404).json({ msg: "Token inválido" });
    }

    //* Delete token n' Activate Account
    tokenExists.token = "";
    tokenExists.accountActivated = 1;

    //* Save query
    await tokenExists.save();

    return res.status(200).json({ msg: "Cuenta activada correctamente" });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha Ocurrido un error: ${error.message}` });
  }
};

const addFavorites = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const { idRecipe } = req.params;

  try {
    const recipeFound = await RecipesModel.find({ _id: idRecipe });
    if (!recipeFound || recipeFound.length === 0) {
      return res.status(404).json({ msg: "La receta no existe" });
    }

    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);

    const userFound = await UserModel.findById(tokenDecoded.id);

    if (!userFound || userFound.length === 0) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    if (userFound._id.toString() !== recipeFound[0].userId.toString()) {
      return res
        .status(403)
        .json({ msg: "No tienes permisos para agregar la receta" });
    }

    let isFavoirteValid = true;
    userFound.favorites.forEach((favoriteState) => {
      favoriteState.toString() === idRecipe && (isFavoirteValid = false);
    });

    if (isFavoirteValid === false) {
      return res
        .status(400)
        .json({ msg: "Esa receta ya está guardada en favoritos" });
    }

    userFound.favorites = [...userFound.favorites, idRecipe];
    await userFound.save();

    return res.status(200).json(userFound);
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
};

const deleteFavorites = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const { idRecipe } = req.params;

  try {
    const recipeFound = await RecipesModel.find({ _id: idRecipe });
    if (!recipeFound || recipeFound.length === 0) {
      return res.status(404).json({ msg: "La receta no existe" });
    }

    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);

    const userFound = await UserModel.findById(tokenDecoded.id);

    if (!userFound || userFound.length === 0) {
      return res.status(404).json({ msg: "El usuario no existe" });
    }

    if (userFound._id.toString() !== recipeFound[0].userId.toString()) {
      return res
        .status(403)
        .json({ msg: "No tienes permisos para elmiinar la receta" });
    }

    let isFavoirteValid = userFound.favorites.find(
      (favoriteState) => favoriteState.toString() === idRecipe
    );

    if (isFavoirteValid === undefined) {
      return res
        .status(400)
        .json({ msg: "Esa receta ya está eliminada de favoritos" });
    }

    userFound.favorites = userFound.favorites.filter(
      (favoriteState) => favoriteState.toString() !== idRecipe
    );

    await userFound.save();

    return res.status(200).json(userFound);
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
};

const decodeTheToken = (req, res) => {
  const { token } = req.body;

  try {
    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);
    return res.status(200).json(tokenDecoded);
  } catch (error) {
    return res.status(400).json({ msg: `Ocurrió un error: ${error.message}` });
  }
};

module.exports = {
  signIn,
  signUp,
  deleteMyAccount,
  editMyAccount,
  forgotPassword,
  changePassword,
  confirmAccount,
  addFavorites,
  deleteFavorites,
  decodeTheToken,
};
