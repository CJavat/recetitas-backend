const mongoose = require("mongoose");

const db = mongoose
  .connect(`mongodb+srv://${process.env.DB}`)
  .then(() => console.log("DB connection established"))
  .catch((error) =>
    console.error("An error occurred while connecting: ", error)
  );

module.exports = db;
