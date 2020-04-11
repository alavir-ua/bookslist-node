const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

let config = {};
if(typeof process.env.PORT !== "undefined")
  config = dbConfig.prod;
else
  config = dbConfig.dev;

// Create a connection to the database
const connection = mysql.createPool({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DB
});

module.exports = connection;
