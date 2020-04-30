const user = require("../controllers/user.controller");
const authUser = require('../middlewares/user-auth');

module.exports = app => {

  app.all("/cabinet*", authUser, function(req, res, next) {
    next();
  });

  // Кабинет пользователя
  app.get("/cabinet", user.cabinet);

  // Просмотр истории
  app.get("/cabinet/orders/:userId", user.orders_index);

  app.get("/cabinet/order/view/:orderId", user.order_view);

  // app.get("/cabinet/order/delete/:orderId",  user.order_delete);
};
