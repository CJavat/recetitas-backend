//* Configure .env file
require("dotenv").config();

//* Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

//* Import data base
const db = require("./database/db");

//* Import routes
const authRoute = require("./routes/auth.routes");
const recipesRoute = require("./routes/recipes.routes");

const app = express();

//* Enable static folders
app.use(express.static(path.join(__dirname, "/public/img")));

//* Enable body-parser
app.use(bodyParser.json());

//* Enable CORS
app.use(cors());

//* Enble routes.
app.use("/auth", authRoute);
app.use("/recipes", recipesRoute);

const port = process.env.LOCALPORT || process.env.PORT;
app.listen(port, () => {
  console.log("listening on port " + port);
});
