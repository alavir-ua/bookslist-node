const admin = require("../controllers/admin.controller");
const cart = require("../controllers/cart.controller");
const catalog = require("../controllers/catalog.controller");
const order = require("../controllers/order.controller");
const site = require("../controllers/site.controller");
const user = require("../controllers/user.controller");
const authAdmin = require('../middlewares/admin-auth');
const authUser = require('../middlewares/user-auth');
const {userValidationRules, validate} = require('../middlewares/validator')

module.exports = app => {
  // admin.routes
  app.all("/admin*", authAdmin, function(req, res, next) {
    next();
  });
  app.get("/admin", admin.index);
  app.get("/admin/books", admin.book_index);
  app.all("/admin/book/create", admin.book_create);
  app.all("/admin/book/update/:bookId", admin.book_update);
  app.get("/admin/book/delete/:bookId", admin.book_delete);
  app.get("/admin/genres", admin.genres_index);
  app.all("/admin/genre/create", admin.genre_create);
  app.all("/admin/genre/update/:genreId", admin.genre_update);
  app.get("/admin/authors", admin.authors_index);
  app.all("/admin/author/create", admin.author_create);
  app.all("/admin/author/update/:authorId", admin.author_update);
  app.get("/admin/orders", admin.orders_index);
  app.get("/admin/order/view/:orderId", admin.order_view);
  app.get("/admin/order/delete/:orderId", admin.order_delete);
  // cabinet.routes
  app.all("/cabinet*", authUser, function(req, res, next) {
    next();
  });
  app.get("/cabinet", user.cabinet);
  app.get("/cabinet/orders/:userId", user.orders_index);
  app.get("/cabinet/order/view/:orderId", user.order_view);
  // cart.routes
  app.get("/cart", cart.index);
  app.get("/cart/add/:bookId", cart.add);
  app.get("/cart/remove/:bookId", cart.remove);
  app.get("/cart/clear", cart.clear);
  // catalog.routes
  app.get("/catalog", catalog.index);
  app.get("/catalog/genre/:genreId", catalog.genre);
  app.get("/catalog/author/:authorId", catalog.author);
  //order.routes
  app.all("/order/place", authUser, order.place);
  app.get("/order/:orderId/card", authUser, order.card);
  app.post("/order/charge", authUser, order.charge);
  // user.routes
  app.get("/user/register", user.register);
  app.post("/user/register", userValidationRules(), validate, user.register);
  app.all("/user/login", user.login);
  app.all("/user/logout", user.logout);
  // site.routes
  app.get("/", site.index);
  app.get("/about", site.about);
  app.get("/contacts", site.contacts);
  app.post("/mail", site.mail);
  app.get("/view/:bookId", site.view);
  app.get("/:bookId/:bookName/download", site.download);
  app.get("*", site.not_found);
};
