const User = require("../models/user.model.js");
const Order = require("../models/order.model.js");
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
  if (Object.keys(req.body).length === 0) {
    let title = 'Регистрация';
    res.render('user/register', {title});
  } else {

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      role: 'user',
    });

    User.create(user, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User"
        });

      User.findUserByEmail(data.email, (err, user) => {
        if (err) return res.status(500).send('Server error!');
        if (user) {
          req.session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email
          };
          res.end();
        }
      });
    });
  }
};

exports.login = (req, res) => {
  let title = 'Логин';
  if (Object.keys(req.body).length === 0) {
    return res.render('user/login', {title});
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findUserByEmail(email, (err, user) => {

    if (!user) return res.render('user/login', {title, error: 'Пользователь с таким email не найден'});

    const result = bcrypt.compareSync(password, user.password);

    if (!result) return res.render('user/login', {title, error: 'Некорректный пароль'});

    req.session.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    if (typeof req.session.redirectTo !== 'undefined') {
      let redirectTo = req.session.redirectTo;
      delete req.session.redirectTo;
      res.redirect(redirectTo);
    } else {
      res.redirect('/cabinet');
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) return res.send('Logout error');
    return res.redirect('/user/login');
  })
};

exports.cabinet = (req, res) => {
  User.findUserById(req.session.user.id, (err, user) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with id " + req.params.userId
        });
      }
    }
    let title = 'Кабинет';
    res.render('cabinet/index', {title, user});
  });
};

exports.orders_index = (req, res) => {
  Order.getOrdersByUseId(req.session.user.id, (err, orders) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders for user"
      });
    let title = 'Просмотр заказов';
    res.render('cabinet/user_order/index', {title, orders});
  });
};

exports.order_view = (req, res) => {
  // проверка принадлежности заказа пользователю

  Order.checkBelongToUser(req.params.orderId, req.session.user.id, (err, result) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving order with id " + req.params.orderId
        });
      }
    }
    let title = 'Обзор заказа';
    if (result !== null && result.user_id === req.session.user.id) {
      Order.getOrderById(req.params.orderId, (err, order) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found order with id ${req.params.orderId}.`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving order with id " + req.params.orderId
            });
          }
        }
        Order.getBooksByOrderId(req.params.orderId, (err, books) => {
          if (err) {
            if (err.kind === "not_found") {
              res.status(404).send({
                message: `Not found books with order id ${req.params.orderId}.`
              });
            } else {
              res.status(500).send({
                message: "Error retrieving books with order id " + req.params.orderId
              });
            }
          }
          order.books = books;
          res.render('cabinet/user_order/view', {title, order});
        });
      });
    } else {
      let message = 'У Вас нет прав просмотра этого заказа';
      res.render('cabinet/user_order/view', {title, message});
    }
  });
}

exports.order_hide = (req, res) => {
  Order.checkBelongToUser(req.params.orderId, req.session.user.id, (err, result) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving order with id " + req.params.orderId
        });
      }
    }
    let title = 'Обзор заказа';
    if (result !== null && result.user_id === req.session.user.id) {
      Order.hideOrderById(req.params.orderId, (err, result) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while hided order"
          });
        console.log(result);
        res.redirect('/cabinet/orders');
      });
    } else {
      let message = 'У Вас нет прав управлять этим заказом';
      res.render('cabinet/user_order/view', {title, message});
    }
  });
}

exports.user_update = (req, res) => {
  let title = 'Редактирование данных';
  if (Object.keys(req.body).length === 0) {
    User.findUserById(req.session.user.id, (err, user) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId
          });
        }
      }
      res.render('cabinet/user/user_update', {title, user});
    });
  } else {

    const options = {
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    }

    User.updateUserById(req.session.user.id, options, (err, result) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating the User"
        });
      console.log(result);
      User.findUserByEmail(req.body.email, (err, user) => {
        if (err) return res.status(500).send('Server error!');
        if (user) {
          req.session.user.email = user.email;
          res.send();
        }
      });
    });
  }
}
