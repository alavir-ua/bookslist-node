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

User.findByEmail = (email, result) => {
  sql.query('SELECT * FROM users WHERE email = ?',email , (err, res) => {
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

module.exports = User;

