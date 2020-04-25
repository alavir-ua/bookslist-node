const order = require("../controllers/order.controller");
const authUser = require('../middlewares/user-auth');

module.exports = app => {

  app.all("/order/place", authUser, order.place);

  app.post("/order/charge", authUser, order.charge);

};
