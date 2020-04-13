const {Book} = require("../models/book.model");
const Genre = require("../models/genre.model");
const Author = require("../models/author.model");
const Cart = require("../models/cart.model");
const stripeConfig = require("../config/stripe.config.js");
const sk = stripeConfig.SECRET_KEY;
const stripe = require('stripe')(sk);

exports.index = (req, res) => {
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

      let title = 'Корзина';
      if (!req.session.cart) {
        res.render('cart/index', {title, genresList, authorsList});
      } else {
        let cart = new Cart(req.session.cart);
        let booksInCart = cart.getItems();
        let totalPrice = cart.totalPrice;
        res.render('cart/index', {title, genresList, authorsList, booksInCart, totalPrice});
      }
    });
  });
}

exports.add = (req, res) => {
  let productId = req.params.bookId;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  Book.getBookForCart(productId, (err, book) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found book with id ${productId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving book with id " + productId
        });
      }
    }
    cart.addBook(book, productId);
    req.session.cart = cart;
    res.status(200).json({ count: cart.totalItems});
  });
};

exports.remove = (req, res) => {
  let productId = req.params.bookId;
  let cart = new Cart(req.session.cart);
  cart.removeBook(productId);
  req.session.cart = cart;
  let booksInCart = cart.getItems();
  res.status(200).json({ booksInCart: booksInCart, count: cart.totalItems, totalPrice: cart.totalPrice });
}

exports.clear = (req, res) => {
  let cart = new Cart(req.session.cart);
  cart.clear();
  req.session.cart = cart;
  res.status(200).json({ count: cart.totalItems});
}

exports.checkout = (req, res) => {
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
      res.render('cart/checkout', {title, genresList, authorsList});
    });
  });
};

exports.charge = (req, res) => {
  let title = 'Completed';
  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken
      })
      .then(customer =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id
        })
      )
      .then(() => res.render('cart/completed', {title}))
      .catch(err => console.log(err));
  } catch (err) {
    res.send(err);
  }
};


