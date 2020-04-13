const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const {Book, addImageUri} = require("../models/book.model");
const config = require("../config/site.config");

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

      Book.getCountBooks((err, totalBooks) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving books count"
          });

        let pageSize = config.SHOW_BY_DEFAULT,
          pageCount = Math.ceil(totalBooks / pageSize),
          currentPage = 1;

        //set current page if specified as get variable (eg: /?page=2)
        if (typeof req.query.page !== 'undefined') {
          currentPage = +req.query.page;
        }
        Book.getBooksLimit(currentPage, pageSize, (err, booksLimit) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving books for page"
            });
          booksLimit = addImageUri(booksLimit);
          let title = 'Каталог';
          res.render('catalog/index', {
            title,
            genresList,
            authorsList,
            booksLimit,
            pageSize,
            totalBooks,
            pageCount,
            currentPage
          });
        });
      });
    });
  });
};

exports.genre = (req, res) => {

  let genreId = req.params.genreId;

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

      Book.getCountBooksInGenre(genreId, (err, totalBooks) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving books count"
          });

        let pageSize = config.SHOW_BY_DEFAULT,
          pageCount = Math.ceil(totalBooks / pageSize),
          currentPage = 1;

        //set current page if specified as get variable (eg: /?page=2)
        if (typeof req.query.page !== 'undefined') {
          currentPage = +req.query.page;
        }
        Book.getBooksLimitByGenre(genreId, currentPage, pageSize, (err, booksLimit) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving books for page"
            });
          let title = 'Каталог по жанру';
          booksLimit = addImageUri(booksLimit);
          res.render('catalog/genre', {
            title,
            genresList,
            authorsList,
            booksLimit,
            genreId,
            pageSize,
            totalBooks,
            pageCount,
            currentPage
          });
        });
      });
    });
  });
};

exports.author = (req, res) => {

  let authorId = req.params.authorId;

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

      Book.getBooksIdsByAuthor(authorId, (err, idsObject) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while books idsArray by author"
          });

        Book.getCountBooksByAuthor(authorId, (err, totalBooks) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving books count"
            });

          let pageSize = config.SHOW_BY_DEFAULT,
            pageCount = Math.ceil(totalBooks / pageSize),
            currentPage = 1;

          //set current page if specified as get variable (eg: /?page=2)
          if (typeof req.query.page !== 'undefined') {
            currentPage = +req.query.page;
          }

          Book.getBooksLimitByAuthor(authorId, idsObject, currentPage, pageSize, (err, booksLimit) => {
            if (err)
              res.status(500).send({
                message:
                  err.message || "Some error occurred while retrieving books for page"
              });
            let title = 'Каталог по автору';
            booksLimit = addImageUri(booksLimit);
            res.render('catalog/author', {
              title,
              genresList,
              authorsList,
              booksLimit,
              authorId,
              pageSize,
              totalBooks,
              pageCount,
              currentPage
            });
          });
        });
      });
    });
  });
};
