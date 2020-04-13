const sql = require("../helpers/db.js");
const fs = require('fs');

// Конструктор
const Book = function (book) {
  this.b_code = book.code;
  this.b_name = book.name;
  this.b_price = book.price;
  this.b_description = book.description;
  this.b_is_new = book.is_new;
  this.b_is_recommended = book.is_recommended;
  this.b_status = book.status;
};

//Добавляет новую книгу
Book.createBook = (newBook, options, result) => {
  sql.query("INSERT INTO books SET ?", newBook, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created book: ", {id: res.insertId, ...newBook});
    result(null, {id: res.insertId, ...newBook});
    let bookId = res.insertId;

    options.genres.forEach(function (genre_id) {
      sql.query(`INSERT INTO m2m_books_genres (g_id, b_id ) VALUE (${genre_id}, ${bookId})`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        result(null, {id: res.insertId});
      });
    })

    options.authors.forEach(function (author_id) {
      sql.query(`INSERT INTO m2m_books_authors (a_id, b_id ) VALUE (${author_id}, ${bookId})`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        result(null, {id: res.insertId});
      });
    })
  });

};

//Удаляет книгу
/*Book.deleteBookById = (bookId, result) => {
  sql.query("DELETE FROM books WHERE b_id = ?", bookId, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows === 0) {
      // not found book with the id
      result({kind: "not_found"}, null);
      return;
    }

    console.log("deleted book with id: ", bookId);
    result(null, res);
  });
};*/

//Редактирует книгу с заданным id
/*Book.updateBookById = (bookId, book, result) => {
  sql.query(
    "UPDATE books SET email = ?, name = ?, active = ? WHERE id = ?",
    [customer.email, customer.name, customer.active, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows === 0) {
        // not found Customer with the id
        result({kind: "not_found"}, null);
        return;
      }

      console.log("updated customer: ", {id: id, ...customer});
      result(null, {id: id, ...customer});
    }
  );
};*/

//Возвращает массив с информацей о книге
Book.getBookById = (bookId, result) => {
  sql.query(`SELECT b_id             AS id,
                    b_code           AS code,
                    b_name           AS name,
                    b_price          AS price,
                    b_description    AS description,
                    b_is_new         AS is_new,
                    b_status         AS status,
                    b_is_recommended AS is_recommended,
                    GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                                     AS authors,
                    GROUP_CONCAT(DISTINCT g_name ORDER BY g_name)
                                     AS genres
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
                    JOIN m2m_books_genres USING (b_id)
                    JOIN genres USING (g_id)
  WHERE b_id = ${bookId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log(`Found book in database with id=${bookId}`);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({kind: "not_found"}, null);
  });

}

//Возвращает массив с информацей о книге для корзины
Book.getBookForCart = (bookId, result) => {
  sql.query(`SELECT b_id    AS id,
                    b_code  AS code,
                    b_name  AS name,
                    b_price AS price,
                    GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                            AS authors,
                    GROUP_CONCAT(DISTINCT g_name ORDER BY g_name)
                            AS genres
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
                    JOIN m2m_books_genres USING (b_id)
                    JOIN genres USING (g_id)
  WHERE b_id = ${bookId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log(`Found book in database for cart with id=${bookId}`);
      // result(null, Object.values(JSON.parse(JSON.stringify(res)))[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({kind: "not_found"}, null);
  });

}

//Возвращает общее число строк записей в каталоге (status = 1)
Book.getCountBooks = result => {
  sql.query(`SELECT count(b_id) AS count
             FROM books
             WHERE b_status = 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res[0].count} books in database`);
    result(null, res[0].count);
  });
};

//Возвращает массив с информацей о книгах для каталога(пагинация)
Book.getBooksLimit = (currentPage, pageSize, result) => {

  let offset = (currentPage - 1) * pageSize;

  sql.query(`SELECT
               b_id  AS id,
               b_name  AS name,
               b_price  AS price,
               b_is_new  AS is_new,
               GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                 AS authors
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
             WHERE b_status=1
             GROUP BY b_id
             ORDER BY b_id DESC
             LIMIT ${pageSize}
             OFFSET ${offset}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} books in database for page ${currentPage}`);
    result(null, res);
  });
};

//Возвращает массив с информацей о книгах для админпанели
Book.getAdminBooksLimit = (currentPage, pageSize, result) => {

  let offset = (currentPage - 1) * pageSize;

  sql.query(`SELECT 
        b_id  AS id,
        b_code  AS code,
        b_name  AS name,
        b_price  AS price,
        b_is_new  AS is_new,
        b_is_recommended  AS is_recommended,
        b_status  AS status,
		GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
		AS authors,
    GROUP_CONCAT(DISTINCT g_name ORDER BY g_name)
		AS genres
		FROM books
JOIN m2m_books_authors USING (b_id)
JOIN authors USING (a_id)
JOIN m2m_books_genres USING (b_id)
JOIN genres USING (g_id)
GROUP BY b_id
ORDER BY b_id DESC
LIMIT ${pageSize}
OFFSET ${offset}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} books in database for admin page ${currentPage}`);
    result(null, res);
  });
};

//Возврвщает число строк записей в каталоге по жанру
Book.getCountBooksInGenre = (genreId, result) => {
  sql.query(`SELECT count(g_id) AS count
             FROM m2m_books_genres
  WHERE g_id=${genreId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res[0].count} books in database with genre id=${genreId}`);
    result(null, res[0].count);
  });
};

//Возвращает массив с информацей о книгах по жанру для каталога(пагинация)
Book.getBooksLimitByGenre = (genreId, currentPage, pageSize, result) => {

  let offset = (currentPage - 1) * pageSize;

  sql.query(`SELECT
               b_id  AS id,
               b_name  AS name,
               b_price  AS price,
               b_is_new  AS is_new,
               GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                 AS authors
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
                    JOIN m2m_books_genres USING (b_id)
                    JOIN genres USING (g_id)
             WHERE b_status=1 and g_id=${genreId}
             GROUP BY b_id
             ORDER BY b_id DESC
             LIMIT ${pageSize}
             OFFSET ${offset}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} books with genre id=${genreId} in database for page ${currentPage}`);
    result(null, res);
  });
};

//Возвращает число строк записей в каталоге по автору
Book.getCountBooksByAuthor = (authorId, result) => {
  sql.query(`SELECT count(a_id) AS count
             FROM m2m_books_authors
  WHERE a_id=${authorId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res[0].count} books in database by author id=${authorId}`);
    result(null, res[0].count);
  });
};

//Возвращает массив id книг по id автора
Book.getBooksIdsByAuthor = (authorId, result) => {
  sql.query(`SELECT b_id AS id
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
  WHERE b_status = 1
    AND
  a_id =${authorId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log(`Found array ${res} books in database by author id=${authorId}`);
    result(null, res);
  });
};

//Возвращает массив с информацей о книгах по жанру для каталога(пагинация)
Book.getBooksLimitByAuthor = (authorId, idsObject, currentPage, pageSize, result) => {

  if (idsObject.length === 0) {
    result(null, {});
  } else {

    let idsArray = [];
    idsObject.forEach(element =>
      idsArray.push(element.id));
    let idsString = idsArray.join();

    let offset = (currentPage - 1) * pageSize;
    sql.query(`SELECT
			b_id  AS id,
			b_name  AS name,
			b_price  AS price,
			b_is_new  AS is_new,
			GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
			AS authors
			FROM books
	JOIN m2m_books_authors USING (b_id)
	JOIN authors USING (a_id)
	WHERE b_status=1 AND b_id IN (${idsString})
	GROUP BY b_id
	ORDER BY b_id DESC
  LIMIT ${pageSize}
  OFFSET ${offset}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log(`Found ${res.length} books by author id=${authorId} in database for page ${currentPage}`);
      result(null, res);
    });
  }
};

//Возвращает массив с информацей о последних книгах
Book.getLatestBooks = result => {
  sql.query(`SELECT b_id     AS id,
                    b_name   AS name,
                    b_price  AS price,
                    b_is_new AS is_new,
                    GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                             AS authors
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
             WHERE b_status = 1
             GROUP BY b_id
             ORDER BY b_id DESC
             LIMIT 6`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} latest books  in database`);
    result(null, res);
  });
};

//Возвращает массив с информацей о рекомендуемых книгах
Book.getRecommendedBooks = result => {
  sql.query(`SELECT b_id AS id, b_is_new AS is_new
             FROM books
             WHERE b_is_recommended = 1
             GROUP BY b_id
             ORDER BY b_id DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res.length} recommended books  in database`);
    result(null, res);
  });
};

//Возвращает массив с информацей о книгах по id жанра
Book.getBooksByGenreId = (genreId, result) => {
  sql.query(`SELECT
               b_id  AS id,
               b_name  AS name,
               b_price  AS price,
               b_is_new  AS is_new,
               GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
                 AS authors
             FROM books
                    JOIN m2m_books_authors USING (b_id)
                    JOIN authors USING (a_id)
                    JOIN m2m_books_genres USING (b_id)
                    JOIN genres USING (g_id)
             WHERE b_status=1 and g_id=${genreId}
             GROUP BY b_id
             ORDER BY b_id DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log(`Found ${res.length} books in database of genre by id=${genreId}`);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({kind: "not_found"}, null);
  });

}

//Возвращает массив с информацей о книгах по id автора
Book.getBooksByAuthorId = (authorId, result) => {
  sql.query(`SELECT
			b_id  AS id,
			b_name  AS name,
			b_price  AS price,
			b_is_new  AS is_new,
			GROUP_CONCAT(DISTINCT a_name ORDER BY a_name)
			AS authors
			FROM books
	JOIN m2m_books_authors USING (b_id)
	JOIN authors USING (a_id)
	WHERE b_status=1 and a_id=${authorId}
	GROUP BY b_id 
	ORDER BY b_id DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log(`Found ${res.length} books in database of author by id=${authorId}`);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({kind: "not_found"}, null);
  });

}

function addImageUri(booksArray) {

  function getImageUri(bookId){
    let noImage = 'no-image.jpg';
    let path = '/images/books/';
    let pathToBookImage = path + bookId + '.jpg';
    let result = fs.existsSync('upload' + pathToBookImage);
    if (result) {
      return pathToBookImage;
    } else {
      return path + noImage;
    }
  }
  booksArray.forEach(function (book) {
    book.image = getImageUri(book.id)
  })
  return booksArray;
}

module.exports = {Book, addImageUri};
