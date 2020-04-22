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
  sql.query("SELECT g_id AS id, g_name AS name FROM genres  WHERE g_status=1 ORDER BY g_id, g_name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} genres in database`);
    result(null, res);
  });
};

//Возвращает массив жанров книг на сайте
Genre.getGenresListAdmin = result => {
  sql.query('SELECT g_id AS id, g_name AS name, g_status AS status FROM genres ORDER BY g_id ASC', (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} genres in database`);
    result(null, res);
  });
};

//Возвращает обьект жанра по id
Genre.getGenreById = (genreId, result) => {
  sql.query(`SELECT g_id AS id, g_name AS name, g_status AS status FROM genres  WHERE g_id=${genreId} `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found genre in database with id=${genreId}`);
    result(null, res[0]);
  });
};

//Обновляет жанр по id
Genre.updateGenreById = (genreId, genre, result) => {
  sql.query(`UPDATE genres
             SET g_name   = ?,
                 g_status = ?
      WHERE g_id = ${genreId}`,
    [genre.g_name, genre.g_status, genreId],
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
      console.log(`Updated genre with id=${genreId}`);
      result(null, res);
    }
  );
};

module.exports = Genre;
