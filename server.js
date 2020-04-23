const express = require("express");
const process = require('process');
const PORT = process.env.PORT || 3000;
const app = express();

require('./app/middlewares/main')(app, express);

require("./app/routes/site.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/catalog.routes.js")(app);
require("./app/routes/cart.routes.js")(app);
require("./app/routes/admin.routes.js")(app);
require("./app/routes/order.routes.js")(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


