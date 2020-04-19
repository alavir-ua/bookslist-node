const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dbConfig = require('./app/config/db.config');
const config = dbConfig.mongo;
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(session({
  secret: '3fg45ytg56Fg54fd',
  resave: false,
  saveUninitialized: false,
  maxAge: 600000, //10 min
  store: new MongoStore({
    url: `mongodb+srv://${config.USER}:${config.PASSWORD}@cluster0-ojveh.mongodb.net/test?retryWrites=true&w=majority`,
    ttl: 600,// 10 min
    secret: '5Rt67Vcs79jjh',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}));

// use cookieParser
app.use(cookieParser());

// upload storage configuration
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + '/upload/images/books');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// set public folder
app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static(path.join(__dirname + '/upload')));

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.use(multer({
  storage: storageConfig, fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.jpg') {
      return callback(new Error('Only JPG images are allowed'))
    }
    callback(null, true)
  }
}).single('image'));

// res.locals is an object passed to ejs engine
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

require("./app/routes/site.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/catalog.routes.js")(app);
require("./app/routes/cart.routes.js")(app);
require("./app/routes/admin.routes.js")(app);

// set port, listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


