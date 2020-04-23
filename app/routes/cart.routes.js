const cart = require("../controllers/cart.controller");
const authUser = require('../middlewares/user-auth');

module.exports = app => {

  app.get("/cart", cart.index);

  app.get("/cart/add/:bookId", cart.add);

  app.get("/cart/remove/:bookId", cart.remove);

  app.get("/cart/clear", cart.clear);

};


