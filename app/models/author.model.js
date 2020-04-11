const sql = require("../helpers/db.js");

// Конструктор
const Author = function (author) {
  this.name = author.a_name;
};

//Добавляет нового автора
Author.createAuthor = (newAuthor, result) => {
  sql.query("INSERT INTO authors SET ?", newAuthor, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created author: ", {id: res.insertId, ...newAuthor});
    result(null, {id: res.insertId, ...newAuthor});
    return res.insertId;
  });
};

//Возвращает массив авторов книг на сайте
Author.getAuthorsList = result => {
  sql.query("SELECT a_id AS id, a_name AS name FROM authors  GROUP BY a_id ORDER BY a_id ASC ", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} authors in database`);
    result(null, res);
  });
};

module.exports = Author;
