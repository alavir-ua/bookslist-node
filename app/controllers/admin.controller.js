const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const Book = require("../models/book.model");
const Order = require("../models/order.model");
const fs = require('fs');

exports.index = (req, res) => {
  let title = 'Админпанель';
  res.render('admin/index', {title});
}

// Управление книгами
exports.book_index = (req, res) => {
  Book.getCountBooks((err, totalBooks) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books count"
      });

    let pageSize = process.env.SHOW_FOR_ADMIN,
      pageCount = Math.ceil(totalBooks / pageSize),
      currentPage = 1;

    //set current page if specified as get variable (eg: /?page=2)
    if (typeof req.query.page !== 'undefined') {
      currentPage = +req.query.page;
    }

    Book.getAdminBooksLimit(currentPage, pageSize, (err, adminBooksLimit) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving books for admin page"
        });
      let title = 'Управление книгами';

      console.log(Object.keys(adminBooksLimit).length);

      res.render('admin/admin_book/index', {
        title,
        adminBooksLimit,
        pageSize,
        totalBooks,
        pageCount,
        currentPage
      });
    });
  });
}

exports.book_create = (req, res) => {
  let title = 'Добавить книгу';
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

        res.render('admin/admin_book/create', {title, authorsList, genresList});
      });
    });
  } else {
    const options = {
      genres: req.body.genre_id,
      authors: req.body.author_id
    }

    let image = '';
    let file = req.file;

    if (!file) {
      image = null;
      console.log("Error loading image");
    } else {
      let old_filename = file.filename;
      image = `/images/books/${old_filename}`
      console.log("Image uploaded successfully");
    }
    const book = new Book({
      name: req.body.name,
      image: image,
      code: req.body.code,
      price: req.body.price,
      description: req.body.description,
      is_new: req.body.is_new,
      is_recommended: req.body.is_recommended,
      status: req.body.status
    });

    Book.createBook(book, options, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Book"
        });

      if (file) {
        let oldPath = 'upload' + `${data.b_image}`;
        let newPath = `upload/images/books/${data.id}.jpg`
        fs.renameSync(oldPath, newPath);
        console.log("Image renamed successfully");
        Book.updateBookImage(data.id, (err, result) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while updating the book image"
            });
          console.log(result);
        });
      }
    });
    res.redirect('/admin/books');
  }
}

exports.book_update = (req, res) => {
  let title = 'Редактировать книгу';
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

        Book.getBookById(req.params.bookId, (err, book) => {
          if (err) {
            if (err.kind === "not_found") {
              res.status(404).send({
                message: `Not found book with id ${req.params.bookId}.`
              });
            } else {
              res.status(500).send({
                message: "Error retrieving book with id " + req.params.bookId
              });
            }
          }
          res.render('admin/admin_book/update', {title, book, authorsList, genresList});
        });
      });
    });
  } else {
    const options = {
      genres: req.body.genre_id,
      authors: req.body.author_id
    }

    let bookId = req.params.bookId;
    let file = req.file;

    const book = new Book({
      code: req.body.code,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      is_new: req.body.is_new,
      is_recommended: req.body.is_recommended,
      status: req.body.status
    });


    Book.updateBookById(bookId, book, options, (err, result) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating the book"
        });

      if (file) {
        let oldPath = 'upload' + `/images/books/${file.filename}`;
        let newPath = `upload/images/books/${bookId}.jpg`
        fs.renameSync(oldPath, newPath);
        console.log("Image renamed successfully");

        Book.updateBookImage(bookId, (err, result) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while updating the book image"
            });
          console.log(result);
        });
      }
    });
    res.redirect('/admin/books');
  }
}

exports.book_delete = (req, res) => {
  Book.deleteBookById(req.params.bookId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found book with id ${req.params.bookId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete book with id " + req.params.bookId
        });
      }
    } else
      fs.access(`upload/images/books/${req.params.bookId}.jpg`, fs.F_OK, (err) => {
        if (err) {
          return
        } else
          fs.unlinkSync(`upload/images/books/${req.params.bookId}.jpg`);
        console.log(`Image of book with id=${req.params.bookId} deleted successfully`);
      })
    res.redirect('/admin/books');
  });
}

// Управление жанрами
exports.genres_index = (req, res) => {
  Genre.getGenresListAdmin((err, genresList) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving genres"
      });
    let title = 'Управление жанрами';
    res.render('admin/admin_genre/index', {title, genresList});
  });
}

exports.genre_create = (req, res) => {
  let title = 'Добавить жанр';
  if (Object.keys(req.body).length === 0) {
    res.render('admin/admin_genre/create', {title});

  } else {

    const genre = new Genre({
      name: req.body.name,
      status: req.body.status,
    });

    Genre.createGenre(genre, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the genre"
        });
      console.log(data)
    });
    res.redirect('/admin/genres');
  }
}

exports.genre_update = (req, res) => {
  let title = 'Редактировать жанр';
  if (Object.keys(req.body).length === 0) {
    Genre.getGenreById(req.params.genreId, (err, genre) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found genre with id ${req.params.genreId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving genre with id " + req.params.genreId
          });
        }
      }
      res.render('admin/admin_genre/update', {title, genre});
    });
  } else {
    let genreId = req.params.genreId;
    const genre = new Genre({
      name: req.body.name,
      status: req.body.status,
    });
    Genre.updateGenreById(genreId, genre, (err, result) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating the book"
        });

    });
    res.redirect('/admin/genres');
  }
}

// Управление авторами
exports.authors_index = (req, res) => {
  Author.getAuthorsListAdmin((err, authorsList) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving genres"
      });
    let title = 'Управление авторам';
    res.render('admin/admin_author/index', {title, authorsList});
  });
}

exports.author_create = (req, res) => {
  let title = 'Добавить автора';
  if (Object.keys(req.body).length === 0) {
    res.render('admin/admin_author/create', {title});

  } else {

    const author = new Author({
      name: req.body.name,
      status: req.body.status,
    });

    Author.createAuthor(author, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the author"
        });
      console.log(data)
    });
    res.redirect('/admin/authors');
  }
}

exports.author_update = (req, res) => {
  let title = 'Редактировать автора';
  if (Object.keys(req.body).length === 0) {
    Author.getAuthorById(req.params.authorId, (err, author) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found genre with id ${req.params.authorId}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving genre with id " + req.params.authorId
          });
        }
      }
      res.render('admin/admin_author/update', {title, author});
    });
  } else {
    let authorId = req.params.authorId;
    const author = new Author({
      name: req.body.name,
      status: req.body.status,
    });
    Author.updateAuthorById(authorId, author, (err, result) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating the book"
        });

    });
    res.redirect('/admin/authors');
  }
}

// Управление заказами
exports.orders_index = (req, res) => {
  Order.getCountOrders((err, totalOrders) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving orders count"
      });

    let pageSize = config.SHOW_FOR_ADMIN,
      pageCount = Math.ceil(totalOrders / pageSize),
      currentPage = 1;

    //set current page if specified as get variable (eg: /?page=2)
    if (typeof req.query.page !== 'undefined') {
      currentPage = +req.query.page;
    }

    Order.getAdminOrdersLimit(currentPage, pageSize, (err, adminOrdersLimit) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving orders for admin page"
        });
      let title = 'Управление заказами';
      res.render('admin/admin_order/index', {
        title,
        adminOrdersLimit,
        pageSize,
        totalOrders,
        pageCount,
        currentPage
      });
    });
  });
}

exports.order_view = (req, res) => {
  Order.getOrderById(req.params.orderId, (err, order) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found book with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving book with id " + req.params.orderId
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
      let title = 'Обзор заказа';
      res.render('admin/admin_order/view', {title, order});
    });
  });
}

exports.order_delete = (req, res) => {
  Order.deleteOrderById(req.params.orderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found order with id ${req.params.orderId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete order with id " + req.params.orderId
        });
      }
    } else
    res.redirect('/admin/orders');
  });
}
