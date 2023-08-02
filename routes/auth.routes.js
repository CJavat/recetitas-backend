const express = require("express");
const router = express.Router();

//* Get controllers
const {
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
} = require("../controllers/auth.controllers");

router.post("/sign-in", signIn);
router.post("/sign-up", signUp);
router.delete("/delete-account", deleteMyAccount);
router.put("/edit-account", editMyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/change-password/:token", changePassword);
router.post("/confirm-account/:token", confirmAccount);
router.post("/add-favorite/:idRecipe", addFavorites);
router.put("/delete-favorite/:idRecipe", deleteFavorites);
router.post("/decode-token", decodeTheToken);

module.exports = router;
