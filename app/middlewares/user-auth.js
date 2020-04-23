module.exports = function(req, res, next) {
  if (typeof req.session.user !== 'undefined' && req.session.user.role === 'user') {
    next();
  } else {
    req.session.redirectTo = '/order/place';
    res.redirect('/user/login');
  }
}
