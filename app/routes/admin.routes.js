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
  app.all("/admin/book/create", admin.book_create);
  app.all("/admin/book/update/:bookId", admin.book_update);
  app.get("/admin/book/delete/:bookId", admin.book_delete);

  // Управление жанрами
  app.get("/admin/genres", admin.genres_index);
  app.all("/admin/genre/create", admin.genre_create);
  app.all("/admin/genre/update/:genreId", admin.genre_update);

  // Управление авторами
  app.get("/admin/authors", admin.authors_index);
  app.all("/admin/author/create", admin.author_create);
  app.all("/admin/author/update/:authorId", admin.author_update);

  // Управление заказами
  // app.get("/admin/orders", admin.order_index);
  // app.get("/admin/order/update/:orderId", admin.order_update);
  // app.get("/admin/order/delete/:orderId", admin.order_delete);

};

