const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const Book = require("../models/book.model");
const config = require("../config/site.config");
const fs = require('fs');

exports.index = (req, res) => {
  let title = 'Админпанель';
  res.render('admin/index', {title});
}

exports.book_index = (req, res) => {
  Book.getCountBooks((err, totalBooks) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving books count"
      });

    let pageSize = config.SHOW_FOR_ADMIN,
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
  console.log(Object.keys(req.body).length)
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

exports.genre_index = (req, res) => {
  Genre.getGenresList((err, genresList) => {
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
