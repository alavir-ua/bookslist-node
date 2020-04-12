const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const Book = require("../models/book.model");
const config = require("../config/site.config");

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

        return res.render('admin/admin_book/create', {title, authorsList, genresList});
      });
    });
  }


}
