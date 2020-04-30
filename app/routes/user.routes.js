const user = require("../controllers/user.controller");
const {userValidationRules, validate} = require('../middlewares/validator')

module.exports = app => {

  // Форма регистрации
  app.get("/user/register", user.register);

  // Регистрация
  app.post("/user/register", userValidationRules(), validate, user.register);

  // Логин
  app.all("/user/login", user.login);

  // Выход с аккаунта
  app.all("/user/logout", user.logout);

};
