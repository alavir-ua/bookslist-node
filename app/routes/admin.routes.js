const admin = require("../controllers/admin.controller");
const authAdmin = require('../middlewares/admin-auth');

module.exports = app => {

  app.all("/admin*", authAdmin, function(req, res, next) {
    next();
  });

  // Главная страница админки
  app.get("/admin", admin.index);

  // Управление книгами:
  app.get("/admin/books", admin.book_index);
  // app.get("/admin/book/create", admin.book_create);
  // app.get("/admin/book/update/:bookId", admin.book_update);
  // app.get("/admin/book/delete/:bookId", admin.book_delete);
  //
  // // Управление жанрами
  // app.get("/admin/genres", admin.genre_index);
  // app.get("/admin/genre/create", admin.genre_create);
  // app.get("/admin/genre/update/:genreId", admin.genre_update);
  //
  // // Управление авторами
  // app.get("/admin/authors", admin.author_index);
  // app.get("/admin/author/create", admin.author_create);

  // Управление заказами
  // app.get("/admin/orders", admin.order_index);
  // app.get("/admin/order/update/:orderId", admin.order_update);
  // app.get("/admin/order/delete/:orderId", admin.order_delete);

};

