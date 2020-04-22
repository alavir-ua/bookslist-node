const sql = require("../helpers/db.js");

// Конструктор
const Genre = function (genre) {
  this.g_name = genre.name;
  this.g_status = genre.status;
};

//Добавляет новый жанр
Genre.createGenre = (newGenre, result) => {
  sql.query("INSERT INTO genres SET ?", newGenre, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created genre: ", {id: res.insertId, ...newGenre});
    result(null, {id: res.insertId, ...newGenre});
  });
};

//Возвращает массив жанров книг на сайте
Genre.getGenresList = result => {
  sql.query("SELECT g_id AS id, g_name AS name, g_status AS status FROM genres  GROUP BY g_id ORDER BY g_id ASC ", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} genres in database`);
    result(null, res);
  });
};

module.exports = Genre;
