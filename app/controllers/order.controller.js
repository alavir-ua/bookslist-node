const Genre = require("../models/genre.model");
const Author = require("../models/author.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const stripeConfig = require("../config/stripe.config.js");
const sk = stripeConfig.SECRET_KEY;
const stripe = require('stripe')(sk);

exports.place = (req, res) => {
  if (Object.keys(req.body).length === 0) {
    Author.getAuthorsList((err, authorsList) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving authors list"
        });

      Genre.getGenresList((err, genresList) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving genres list"
          });
        let title = 'Оформление заказа';
        res.render('order/form', {title, genresList, authorsList});
      });
    });
  } else {
    let number = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
    const order = new Order({
      order_number: 'ORD-' + number,
      user_id: req.session.user.id,
      status: 'pending',
      grand_total: req.session.cart.totalPrice,
      item_count: req.session.cart.totalItems,
      payment_status: 0,
      payment_method: null,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      post_code: req.body.post_code,
      phone_number: req.body.phone_number,
      notes: req.body.notes,
    })

    Order.createOrder(order, (err, result) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Order"
        });
      res.redirect(`/order/${result.id}/card`);
    });
  }
};

exports.card = (req, res) => {
  Author.getAuthorsList((err, authorsList) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving authors list"
      });

    Genre.getGenresList((err, genresList) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving genres list"
        });
      let orderId = req.params.orderId
      Order.getOrderById(orderId, (err, order) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found order with id ${orderId}`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving order with id " + orderId
            });
          }
        }
        let title = 'Оплата картой';
        if(order.payment_status !== 1 && order.payment_method === null && order.status !== 'completed'){
          return res.render('order/card', {title, orderId, genresList, authorsList});
        }
        let message = `Заказ #${order.order_number} уже оплачен`;
        return res.render('order/card', {title, message, genresList, authorsList});
      });
    });
  });
};

exports.charge = (req, res) => {
  Author.getAuthorsList((err, authorsList) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving authors list"
      });

    Genre.getGenresList((err, genresList) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving genres list"
        });

      let orderId = req.body.order_id;
      Order.getOrderById(orderId, (err, order) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found order with id ${orderId}`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving order with id " + orderId
            });
          }
        }
        let chargeObject = {};
        const token = req.body.stripeToken;
        chargeObject.amount = order.grand_total * 100;
        chargeObject.currency = "uah";
        chargeObject.source = token;
        chargeObject.description = `Payment order #${order.order_number} from ${order.first_name} ${order.last_name}`;
        let title = 'Результат платежа';
        stripe.charges.create(chargeObject)
          .then((charge) => {
            // New charge created. record charge object
            if (charge.amount_refunded === 0 && charge.failure_code === null
              && charge.paid === true && charge.captured === true && charge.status === 'succeeded') {
              let options = {};
              options.status = 'completed';
              options.payment_status = 1;
              options.payment_method = 'Stripe-' + charge.payment_method;

              Order.updateOrderById(orderId, options, (err, result) => {
                if (err)
                  res.status(500).send({
                    message:
                      err.message || "Some error occurred while updating the order"
                  });
                // console.log(result)
              });
            }
            let cart = new Cart(req.session.cart);
            cart.clear();
            req.session.cart = cart;
            let message = 'Платеж успешно завершен. ID транзакции ' + charge.balance_transaction;
            res.render('order/card', {title, message, authorsList, genresList});

          }).catch((err) => {
          switch (err.type) {
            case 'StripeCardError':
              err.message = "Год истечения срока действия вашей карты недействителен."
              break;
            case 'StripeInvalidRequestError':
              err.message = "В API Stripe были переданы неверные параметры"
              break;
            case 'StripeAPIError':
              err.message = "Произошла внутренняя ошибка с API Stripe"
              break;
            case 'StripeConnectionError':
              err.message = "Некоторая ошибка произошла во время связи HTTPS"
              break;
            case 'StripeAuthenticationError':
              err.message = "Вы, вероятно, использовали неверный ключ API"
              break;
            case 'StripeRateLimitError':
              err.message = "Слишком много запросов попадают в API слишком быстро"
              break;
          }
          let error = err.message;
          res.render('order/card', {title, error, authorsList, genresList});
        });
      });
    });
  });

};


