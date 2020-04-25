const Genre = require("../models/genre.model");
const Author = require("../models/author.model");
const Order = require("../models/order.model");
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
          let title = 'Платежная карта';
          res.render('order/card', {title, order_id: result.id, genresList, authorsList});
        });
      });
    });
  }
};

exports.charge = (req, res) => {
  let orderId = req.body.order_id;
  console.log('orderId', orderId)
  let chargeObject = {};
  const token = req.body.stripeToken;
  chargeObject.amount = req.session.cart.totalPrice * 100;
  chargeObject.currency = "uah";
  chargeObject.source = token;
  chargeObject.description = "Example charge";

  stripe.charges.create(chargeObject)
    .then((charge) => {
      // New charge created. record charge object
      console.log(charge)
      res.json({charge})
    }).catch((err) => {
    // charge failed. Alert user that charge failed somehow

    switch (err.type) {
      case 'StripeCardError':
        // A declined card error
        err.message = "Your card's expiration year is invalid."
        break;
      case 'StripeInvalidRequestError':
        err.message = "Invalid parameters were supplied to Stripe's API"
        break;
      case 'StripeAPIError':
        err.message = "An error occurred internally with Stripe's API"
        break;
      case 'StripeConnectionError':
        err.message = "Some kind of error occurred during the HTTPS communication"
        break;
      case 'StripeAuthenticationError':
        err.message = "You probably used an incorrect API key"
        break;
      case 'StripeRateLimitError':
        err.message = "Too many requests hit the API too quickly"
        break;
    }
    res.send(err.message)
  });


};


