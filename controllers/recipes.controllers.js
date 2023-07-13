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
  //TODO: TERMINAR CONTROLADOR
};

const getRecipe = async (req, res, next) => {
  //TODO: TERMINAR CONTROLADOR
};

const addRecipe = async (req, res, next) => {
  // req.file.filename => Para recibir el nombre de las fotos.
  // req.body => Para recibir los datos
  //TODO: TERMINAR CONTROLADOR
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
