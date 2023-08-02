const RecipesModel = require("../models/Recipes");
const UserModel = require("../models/Users");
const jwt = require("jsonwebtoken");
const shortId = require("shortid");
const multer = require("multer");
const path = require("path");
const { unlink } = require("node:fs/promises");

//* MULTER - UPLOAD PHOTOS ------------------------------------------
const configuracionMulterArchivos = {
  storage: (fileStorage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, path.join(__dirname + "/../public/img"));
    },

    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortId.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Formato No Válido. Sube un archivo JPG o PNG"));
    }
  },
};

const upload = multer(configuracionMulterArchivos).single("picture");

const uploadPicture = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      return res.json({ msg: error });
    }

    next();
  });
};
//* -----------------------------------------------------------------

const getRecipes = async (req, res, next) => {
  const { idUser } = req.params;

  try {
    const getAllRecipes = await RecipesModel.find({ userId: idUser });

    if (!getAllRecipes || getAllRecipes.length === 0) {
      return res.status(404).json({ msg: "No se han ecnontrado recetas" });
    }

    return res.status(200).json(getAllRecipes);
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
};

const getRecipe = async (req, res, next) => {
  const { idUser } = req.params;
  const { name } = req.body;

  try {
    const getRecipe = await RecipesModel.findOne({ name, userId: idUser });
    if (!getRecipe || getRecipe.length === 0) {
      return res.status(404).json({ msg: "No se encontró la receta" });
    }

    return res.status(200).json(getRecipe);
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
};

const addRecipe = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const userFound = await UserModel.findById(userId);
    if (!userFound || userFound.length === 0) {
      return res
        .status(404)
        .json({ msg: "El usuario que registra la receta no existe" });
    }

    const recipeCreated = await RecipesModel.create(req.body);

    if (!recipeCreated) {
      return res.status(400).json({ msg: "Error al agregar la receta" });
    }

    if (req.file) {
      recipeCreated.picture = req.file.filename;
    }

    await recipeCreated.save();

    return res.status(200).json({ msg: "Receta Creada Correctamente" });
  } catch (error) {
    const arrayErrors = [];

    if (error.errors) {
      error.errors.name?.properties.type === "required" &&
        arrayErrors.push("El NOMBRE es obligatorio");
      error.message ===
        "Recipes validation failed: ingredients.0: Path `ingredients.0` is required." &&
        arrayErrors.push("Los INGREDIENTES son obligatorios");
    }

    return res.status(400).json({ msg: arrayErrors });
  }
};

const editRecipe = async (req, res, next) => {
  const { _id, name, ingrendients, link, picture, userId } = req.body;

  try {
    const recipeFound = await RecipesModel.findOne({ _id, userId });

    if (!recipeFound || recipeFound.length === 0) {
      return res.status(404).json({ msg: "No se encontró la receta" });
    }

    if (req.file?.filename !== undefined) {
      if (req.file?.filename !== recipeFound.picture) {
        const url = path.join(
          __dirname,
          `/../public/img/${recipeFound.picture}`
        );

        await unlink(url);

        recipeFound.picture = req.file.filename;
      }
    }

    if (recipeFound.name !== name) {
      recipeFound.name = name;
    }

    // if() {
    //TODO: TERMINAR LA PARTE DE LOS INGREDIENTES (Esto se hara ya que haga la parte de FRONT)
    // }

    if (recipeFound.link !== link) {
      recipeFound.link = link;
    }

    await recipeFound.save();

    return res.status(200).json({ msg: "Receta Editada Correctamente" });
  } catch (error) {
    const arrayErrors = [];

    if (error.errors) {
      error.errors.name?.properties.type === "required" &&
        arrayErrors.push("El NOMBRE es obligatorio");
      error.message ===
        "Recipes validation failed: ingredients.0: Path `ingredients.0` is required." &&
        arrayErrors.push("Los INGREDIENTES son obligatorios");
    }

    console.log(error.message);
    return res.status(400).json({ msg: arrayErrors || error.message });
  }

  //TODO: TERMINAR CONTROLADOR
};

const deleteRecipe = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const { id } = req.params;

  try {
    const recipe = await RecipesModel.findById(id);
    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!recipe || recipe.length === 0) {
      return res.status(404).json({ msg: "La receta no existe" });
    }

    if (recipe.userId.toString() !== tokenDecoded.id) {
      return res
        .status(403)
        .json({ msg: "Éste usuario no tiene permiso para eliminar la receta" });
    }

    if (recipe.picture) {
      const url = path.join(__dirname, `/../public/img/${recipe.picture}`);
      await unlink(url);
    }

    await recipe.deleteOne();

    return res.status(200).json({ msg: "Receta elminada correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Ocurrió un error en la base de datos: ${error.message}` });
  }
};

const getFavorites = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);
    const userFound = await UserModel.findById(tokenDecoded.id);
    if (!userFound || userFound.length === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (userFound.favorites.length === 0) {
      return res
        .status(404)
        .json({ msg: "No tienes recetas guardadas en favoritos" });
    }

    return res.status(200).json(userFound.favorites);
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
};

module.exports = {
  uploadPicture,
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  getFavorites,
};
