const sql = require("../helpers/db.js");

// Конструктор
const Author = function (author) {
  this.a_name = author.name;
  this.a_status = author.status;
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
  sql.query("SELECT a_id AS id, a_name AS name FROM authors  WHERE a_status=1 ORDER BY a_id, a_name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} authors in database`);
    result(null, res);
  });
};

//Возвращает массив авторов книг для админпанели
Author.getAuthorsListAdmin = result => {
  sql.query('SELECT a_id AS id, a_name AS name, a_status AS status FROM authors ORDER BY a_id ASC', (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} authors in database`);
    result(null, res);
  });
};

//Возвращает обьект автора по id
Author.getAuthorById = (authorId, result) => {
  sql.query(`SELECT a_id AS id, a_name AS name, a_status AS status FROM authors  WHERE a_id=${authorId} `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found author in database with id=${authorId}`);
    result(null, res[0]);
  });
};

//Обновляет автора по id
Author.updateAuthorById = (authorId, author, result) => {
  sql.query(`UPDATE authors
             SET a_name   = ?,
                 a_status = ?
      WHERE a_id = ${authorId}`,
    [author.a_name, author.a_status, authorId],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows === 0) {
        result({kind: "not_found"}, null);
        return;
      }
      console.log(`Updated author with id=${authorId}`);
      result(null, res);
    }
  );
};

module.exports = Author;
