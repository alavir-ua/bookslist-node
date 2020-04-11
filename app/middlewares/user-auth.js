module.exports = function(req, res, next) {
  if (typeof req.session.user !== 'undefined' && req.session.user.role === 'user') {
    next();
  } else {
    req.session.redirectTo = '/cart/checkout';
    res.redirect('/user/login');
  }
}
