const express = require("express");
const process = require('process');
const PORT = process.env.PORT || 3000;
const app = express();

require('./app/middlewares/main')(app, express);

require("./app/routes/routes.js")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


