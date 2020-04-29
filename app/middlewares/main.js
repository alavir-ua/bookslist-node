const bodyParser = require("body-parser");
const multer = require('multer');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const dbConfig = require('../config/db.config');
const config = dbConfig.mongo;
const process = require('process');
const path = require('path');
const moment = require('moment');
moment.locale('ru');

module.exports = function (app, express) {
  app.use(session({
    secret: '3fg45ytg56Fg54fd',
    resave: false,
    saveUninitialized: false,
    maxAge: 1800000, //30 min
    store: new MongoStore({
      url: `mongodb+srv://${config.USER}:${config.PASSWORD}@cluster0-ojveh.mongodb.net/test?retryWrites=true&w=majority`,
      dbName: 'bookslist',
      ttl: 1800,// 30 min
      secret: '5Rt67Vcs79jjh',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }));
  app.use(cookieParser());
  app.set('views', process.cwd() +'/views');
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(process.cwd() + '/public')));
  app.use(express.static(path.join(process.cwd() + '/upload')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });
  app.locals.moment = moment;

  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, process.cwd() + '/upload/images/books');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  app.use(multer({
    storage: storageConfig, fileFilter: function (req, file, callback) {
      let ext = path.extname(file.originalname);
      if (ext !== '.jpg') {
        return callback(new Error('Only JPG images are allowed'))
      }
      callback(null, true)
    }
  }).single('image'));
};
