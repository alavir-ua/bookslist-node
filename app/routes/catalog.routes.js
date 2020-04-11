const catalog = require("../controllers/catalog.controller");

module.exports = app => {

  // Страница "Каталог"
  app.get("/catalog", catalog.index);

  // Страница "Каталог по жанру"
  app.get("/catalog/genre/:genreId", catalog.genre);

  // Страница "Каталог по автору"
  app.get("/catalog/author/:authorId", catalog.author);

};
