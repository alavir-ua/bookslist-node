const sql = require("../helpers/db.js");

// Конструктор
const Order = function (order) {
  this.order_number = order.order_number;
  this.user_id = order.user_id;
  this.status = order.status;
  this.grand_total = order.grand_total;
  this.item_count = order.item_count;
  this.payment_status = order.payment_status;
  this.payment_method = order.payment_method;
  this.first_name = order.first_name;
  this.last_name = order.last_name;
  this.address = order.address;
  this.city = order.city;
  this.country = order.country;
  this.post_code = order.post_code;
  this.phone_number = order.phone_number;
  this.notes = order.notes;
};

Order.createOrder = (newOrder, result) => {
  sql.query("INSERT INTO orders SET ?", newOrder, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("placed order: ", {id: res.insertId, ...newOrder});
    result(null, {id: res.insertId});
  });
};

Order.getOrderById = (orderId, result) => {
  sql.query(`SELECT *
             FROM orders
  WHERE id=${orderId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log(`Found order in database with id=${orderId}`);
      result(null, res[0]);
      return;
    }
    result({kind: "not_found"}, null);
  });

}

Order.updateOrderById = (orderId, options, result) => {
  sql.query(`UPDATE orders
             SET status         = ?,
                 payment_status = ?,
                 payment_method = ?
      WHERE id = ${orderId}`,
    [options.status, options.payment_status, options.payment_method],
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
      console.log(`Updated order with id=${orderId}`);
      result(null, res);
    }
  );
};

Order.getCountOrders = result => {
  sql.query(`SELECT count(id) AS count
             FROM orders`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`Found ${res[0].count} orders in database`);
    result(null, res[0].count);
  });
};

Order.getAdminOrdersLimit = (currentPage, pageSize, result) => {

  let offset = (currentPage - 1) * pageSize;

  sql.query(`SELECT * FROM orders GROUP BY id ORDER BY id DESC LIMIT ${pageSize} OFFSET ${offset}`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log(`Found ${res.length} orders in database for admin page ${currentPage}`);
      result(null, res);
    });
};



Order.deleteOrderById = (bookId, result) => {
  sql.query('DELETE FROM books WHERE b_id = ?', bookId, (err, res) => {
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
};

Order.getOrderForCart = (bookId, result) => {
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

module.exports = Order;
