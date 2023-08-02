const express = require("express");
const router = express.Router();

//* Get controllers
const {
  uploadPicture,
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  getFavorites,
} = require("../controllers/recipes.controllers");

router.get("/get-recipes/:idUser", getRecipes);
router.get("/get-recipe/:idUser", getRecipe);
router.post("/add-recipe", uploadPicture, addRecipe);
router.put("/edit-recipe", uploadPicture, editRecipe);
router.delete("/delete-recipe/:id", deleteRecipe);
router.get("/get-favorites", getFavorites);

module.exports = router;
