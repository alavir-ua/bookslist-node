const process = require('process');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const PORT = process.env.PORT;
const app = express();

require('./app/middlewares/main')(app, express);
require("./app/routes/routes.js")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


