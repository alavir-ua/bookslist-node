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

        res.render('admin/admin_book/create', {title, authorsList, genresList});
      });
    });
  } else {
    const options = {
      genres: req.body.genre_id,
      authors: req.body.author_id
    }
    delete req.body.genre_id;

    delete req.body.author_id;
    let image = '';

    let file = req.file;
    if (!file) {

      image = null;
      console.log("Error loading file");
    } else {
      let old_filename = file.filename;
      image = `/images/books/${old_filename}`
      console.log("File uploaded successfully");
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
    });

    res.redirect('/admin/books');
  }
}
