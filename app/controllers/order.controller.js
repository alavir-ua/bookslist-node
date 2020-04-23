const Genre = require("../models/genre.model");
const Author = require("../models/author.model");
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

  }
};

exports.get_card = (req, res) => {
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

      let title = 'Оплата картой';
      res.render('order/card', {title, genresList, authorsList});
    });
  });
};

exports.charge = (req, res) => {
  let chargeObject = {};
  const token = req.body.stripeToken;
  chargeObject.amount = 100 * 100;
  chargeObject.currency = "uah";
  chargeObject.source = token;
  chargeObject.description = "Example charge";

  stripe.charges.create(chargeObject)
    .then((charge) => {
      // New charge created. record charge object
      console.log(charge.status)
      res.send(charge.status)
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


