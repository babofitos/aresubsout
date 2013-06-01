module.exports = function(type, fn) {
  //fn is limit instance
  return function(req, res, next) {
    var ct = req.headers['content-type'] || ''

    if (ct.indexOf(type) != 0) {
      return next()
    }
    fn(err, req, res, next)
  }
}