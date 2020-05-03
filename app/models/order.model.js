const Cart = require("../models/cart.model");
const sql = require("../helpers/db.js");

// Конструктор
const Order = function (order) {
  this.order_number = order.order_number;
  this.view_status = order.view_status;
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
  this.email = order.email;
  this.notes = order.notes;
};

Order.createOrder = (newOrder, booksInCart, result) => {
  sql.query("INSERT INTO orders SET ?", newOrder, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    let orderId = res.insertId;
    booksInCart.forEach(function (book) {
      sql.query(`INSERT INTO order_items (order_id, book_id, book_name, book_code, quantity, subtotal) VALUE
  (${orderId}, ${book.item.id}, \'${book.item.name}\', ${book.item.code}, ${book.quantity}, ${book.price})`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        console.log(res);
      });
    })
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

Order.getOrdersByUseId = (userId, result) => {
  sql.query(`SELECT id,
                    order_number,
                    grand_total,
                    item_count,
                    view_status,
                    status,
                    created_at
             FROM orders
      WHERE view_status = 1 AND user_id=${userId}
      ORDER BY id DESC`,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log(`Found ${res.length} orders of user with id=${userId}`);
      result(null, res);
    });
}

Order.getBooksByOrderId = (orderId, result) => {
  sql.query(`SELECT book_id AS id, book_name AS name, book_code AS code, quantity, subtotal
             FROM order_items
  WHERE order_id=${orderId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log(`Found order items in database with id=${orderId}`);
      result(null, res);
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

Order.deleteOrderById = (orderId, result) => {
  sql.query('DELETE FROM orders WHERE id = ?', orderId, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows === 0) {
      result({kind: "not_found"}, null);
      return;
    }
    console.log("deleted order with id: ", orderId);
    result(null, res);
  });
};

Order.hideOrderById = (orderId, result) => {
  sql.query(`UPDATE orders
             SET view_status = 0
      WHERE id = ${orderId}`,
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
      console.log(`Hidden order with id=${orderId} for user`);
      result(null, res);
    }
  );
};

Order.checkBelongToUser = (orderId, userId, result) => {
  sql.query(`SELECT user_id
             FROM orders
  WHERE id=${orderId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log(`Order with id=${orderId} belong to user with id=${userId}`);
      result(null, res[0]);
      return;
    }
    result({kind: "not_found"}, null);
  });
};

module.exports = Order;
