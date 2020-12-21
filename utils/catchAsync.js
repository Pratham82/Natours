module.exports = fn => {
  return (req, res, next) => {
    // The annonymous function will call the actual funciton which its wrapped around
    fn(req, res, next).catch(next)
  }
}
