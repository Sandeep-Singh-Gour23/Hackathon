const { JWT_SECRET } = require("../../config/JwtConfig");
const jwt = require("jsonwebtoken");
const { badRequestError } = require("../global_functions");

function VerifyJWT(req, res, next) {
  
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("empty token");
  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return badRequestError(res, "authorization token expired or wrong");
    }

    req.body.email = user.email;
    req.body.userId=user.userId;
    req.body.userName=user.userName;
    

    next();
  });
}
module.exports = VerifyJWT;
