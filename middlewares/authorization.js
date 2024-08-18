const { myError } = require("./errorMiddleware");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "elDradoX";
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return next(
      new myError("You are not authorized,Please Login or Signup.", 403)
    );
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new myError("Invalid Token", 403));
    }
    req.user = decoded;
  });
};
