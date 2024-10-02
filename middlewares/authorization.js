const { myError } = require("./errorMiddleware");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "elDradoX";
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return next(
      new myError("You are not authorized,Please Login or Signup.", 403)
    );
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err.message);
      return next(
        new myError("You are not authorized,Please Login or Signup.", 403)
      );
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
