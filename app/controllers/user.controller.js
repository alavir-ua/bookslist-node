const User = require("../models/user.model.js");
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {

  if (Object.keys(req.body).length === 0) {
    let title = 'Регистрация';
    res.render('user/register', {title});
  } else {

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      role: 'user',
    });

    User.create(user, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User"
        });

      User.findByEmail(data.email, (err, user) => {
        if (err) return res.status(500).send('Server error!');
        if (user) {
          req.session.user = {
            id: user.id,
            role: user.role,
            name: user.name
          };
          res.end();
        }
      });
    });
  }
};

exports.login = (req, res) => {
  let title = 'Логин';
  if (Object.keys(req.body).length === 0) {
    return res.render('user/login', {title});
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findByEmail(email, (err, user) => {

    if (!user) return res.render('user/login', {title, error: 'Пользователь с таким email не найден'});

    const result = bcrypt.compareSync(password, user.password);

    if (!result) return res.render('user/login', {title, error: 'Некорректный пароль'});

    req.session.user = {
      id: user.id,
      role: user.role,
      name: user.name
    };

    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    if (typeof req.session.redirectTo !== 'undefined') {
      let redirectTo = req.session.redirectTo;
      delete req.session.redirectTo;
      res.redirect(redirectTo);
    } else {
      res.redirect('/user/cabinet');
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) return res.send('Logout error');
    return res.redirect('/user/login');
  })
};

exports.cabinet = (req, res) => {
  let title = 'Кабинет';
  res.render('cabinet/index', {title});
};



