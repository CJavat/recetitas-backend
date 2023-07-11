const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hola Mundo2");
});

const port = 8000 || process.env.PORT;
app.listen(port, () => {
  console.log("listening on port " + port);
});
