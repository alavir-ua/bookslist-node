const sql = require("../helpers/db.js");

// constructor
const User = function (user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.role = user.role;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", {id: res.insertId, ...newUser});
    result(null, {id: res.insertId, ...newUser});
    return res.newUser;
  });
};

User.findUserByEmail = (email, result) => {
  sql.query('SELECT * FROM users WHERE email = ?', email, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log(`Found customer in database with email=${res[0].email}`);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({kind: "not_found"}, null);
  });
};

User.findUserById = (userId, result) => {
  sql.query('SELECT id, name, email FROM users WHERE id = ?', userId, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log(`Found customer in database with id=${res[0].id}`);
      result(null, res[0]);
      return;
    }
    // not found Customer with the id
    result({kind: "not_found"}, null);
  });
};

User.updateUserById = (userId, options, result) => {
  sql.query(`UPDATE users
      SET email    = ?,
          password = ?
      WHERE id = ${userId}`,
    [options.email, options.password],
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
      console.log(`Updated user with id=${userId}`);
      result(null, res);
    }
  );
};

module.exports = User;

