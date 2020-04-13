const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const {Book, addImageUri} = require("../models/book.model");
const nodemailer = require("nodemailer");
const config = require("../config/smtp.config");


//Главная страница
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

      Book.getLatestBooks((err, latestBooks) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving latest books"
          });

        Book.getRecommendedBooks((err, recommendedBooks) => {
          if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving recommended books"
            });
          let title = 'Главная';
          latestBooks = addImageUri(latestBooks);
          recommendedBooks = addImageUri(recommendedBooks);
          res.render('site/index', {title, genresList, authorsList, latestBooks, recommendedBooks});
        });
      });
    });
  });
};

// Страница "O магазине"
exports.about = (req, res) => {
  let title = 'О магазине';
  res.render('site/about', {title});
};

// Страница "Контакты"
exports.contacts = (req, res) => {
  let title = 'Контакты';
  res.render('site/contacts', {title});
};

// Отправка письма
exports.mail = (req, res) => {

  const email = req.body.email;
  const text = req.body.text;

  let transporter = nodemailer.createTransport({
    host: config.HOST,
    port: config.PORT,
    secure: false,
    auth: {
      user: config.SMTP_NAME,
      pass: config.PASSWORD
    }
  });

  const data = {
    from: config.SMTP_NAME,
    to: config.ADMIN_MAIL,
    subject: `Письмо от пользователя ${email}`,
    html: `<p>${text}</p>`
  }

  transporter.sendMail(data, (error, result) => {
    let title = 'Контакты';
    if (error) {
      res.render('site/contacts', {title, error});
      console.log(error);
    }
    res.render('site/contacts', {title, result});
    console.log(result);
  });

};

// Обзор книги
exports.view = (req, res) => {
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
        let title = 'Обзор книги';
        book = addImageUri([book]);
        res.render('book/view', {book, authorsList, genresList, title});
      });
    });
  });
};

// Загрузка фото книги
exports.download = (req, res) => {
  let filePath = `upload/images/books/${req.params.bookId}.jpg`;
  let fileName = `${req.params.bookName}.jpg`;
  res.download(filePath, fileName);
};
