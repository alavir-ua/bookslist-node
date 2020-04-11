module.exports = function(req, res, next) {
  if (typeof req.session.user !== 'undefined' && req.session.user.role === 'admin') {
    next();
  } else {
    res.send('Not-access');
  }
}
