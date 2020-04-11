const site = require("../controllers/site.controller");

module.exports = app => {

  // Страница "Главная"
  app.get("/", site.index);

  // Страница "O магазине"
  app.get("/about", site.about);

  // Страница "Контакты"
  app.get("/contacts", site.contacts);

  // Отправка письма
  app.post("/mail", site.mail);

  // Обзор книги с bookId
  app.get("/view/:bookId", site.view);

  // Загрузка фото книги
  app.get("/:bookId/:bookName/download", site.download);

};
