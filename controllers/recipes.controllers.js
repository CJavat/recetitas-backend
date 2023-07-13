const RecipesModel = require("../models/Recipes");
const shortId = require("shortid");
const multer = require("multer");
const path = require("path");

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

    return res.status(200).json({ getAllRecipes });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
  //TODO: TERMINAR CONTROLADOR
};

const getRecipe = async (req, res, next) => {
  const { idUser } = req.params;
  const { name } = req.body;

  try {
    const getRecipe = await RecipesModel.findOne({ name, userId: idUser });
    if (!getRecipe || getRecipe.length === 0) {
      return res.status(404).json({ msg: "No se encontró la receta" });
    }

    return res.status(200).json({ getRecipe });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ msg: `Ha ocurrido un error en la consulta: ${error.message}` });
  }
  //TODO: TERMINAR CONTROLADOR
};

const addRecipe = async (req, res, next) => {
  try {
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
  //TODO: TERMINAR CONTROLADOR
};

const deleteRecipe = async (req, res, next) => {
  //TODO: TERMINAR CONTROLADOR
};

module.exports = {
  uploadPicture,
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
};
