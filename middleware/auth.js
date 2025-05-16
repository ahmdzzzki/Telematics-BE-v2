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
    var token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1m' });
    return token;
  },

  generateRefreshToken: async (user) => {  
    const refreshToken = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' }); // Refresh token berlaku selama 7 hari  
    // Simpan refresh token di database atau cache untuk verifikasi di masa mendatang  
    // await saveRefreshToken(user.id, refreshToken); // Implementasikan fungsi ini untuk menyimpan refresh token  
    return refreshToken;  
  },

  verifyToken: async (req, res, next) => {
    try {
      const {"x-device": deviceHeader, authorization} = req.headers;
      
      // Cek model device (MOBILE)
      if ((deviceHeader !== "MOBILE")) {
        return next();
      }

      // Cek Authorization Header
      if (!authorization) {
        return response.unauthorized(res, "No token provide");
      }

      // Cek Keberadaaan token
      let token = authorization.split(" ")[1];
      if (!token) response.unauthorized(res, "No token provide");

      // Verifikasi token
      let userDataVerify = jwt.verify(token, process.env.SECRET_KEY);

      // Cek data yang terverifikasi
      let userData = await userCheck(userDataVerify.username);
      if (!userData) {  
        return response.unauthorized(res, "User not found");  
      }  
      
      // Simpan data di request
      console.log(userData);
      req.user = userData;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {  
        return response.unauthorized(res, "Token has expired");  
      }  
      return response.unauthorized(res, "Token is invalid");
    }
  },
};
