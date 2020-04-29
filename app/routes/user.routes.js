const user = require("../controllers/user.controller");
const authUser = require('../middlewares/user-auth');
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

  // Кабинет пользователя
  app.get("/user/cabinet", authUser, user.cabinet);

  // Просмотр истории
  app.get("/user/orders/:userId", authUser, user.orders_index);

  // app.get("/user/order/view/:orderId", authUser, user.order_view);

  // app.get("/user/order/delete/:orderId", authUser, user.order_delete);
};
