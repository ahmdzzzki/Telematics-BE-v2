const { tb_m_users } = require("../config/tables");
const jwt = require("jsonwebtoken");
const response = require("../helpers/response");
const { queryGET } = require("../helpers/query");

async function userCheck(username) {
  return await queryGET(tb_m_users, `WHERE username = '${username}'`)
    .then(async (result) => {
      return result[0];
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

module.exports = {
  generateToken: async (payload) => {
    var token = jwt.sign(payload, process.env.SECRET_KEY);
    return token;
  },
  verifyToken: async (req, res, next) => {
    try {

      let header = req.headers["x-device"];
      if ((header !== "MOBILE")) {
        return next();
      }

      let authorization = req.headers["authorization"];

      if (!authorization) {
        return response.unauthorized(res, "No token provide");
      }
      let token = authorization.split(" ")[1];
      if (!token) response.unauthorized(res, "No token provide");
      let userDataVerify = jwt.verify(token, process.env.SECRET_KEY);
      let userData = await userCheck(userDataVerify.username);
      console.log(userData);
      req.user = userData;
      next();
    } catch (error) {
      response.unauthorized(res, "Token Is Invalid");
    }
  },
};
