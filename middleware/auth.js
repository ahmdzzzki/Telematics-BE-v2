const { tb_m_users } = require("../config/tables");
const jwt = require("jsonwebtoken");
const response = require("../helpers/response");
const { queryGET, queryPUT } = require("../helpers/query");


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

async function getStoredRefreshToken(userId) {
  const result = await queryGET(tb_m_users, `WHERE user_id = ${userId}`);
  return result[0]?.refreshToken || null;
}


async function saveRefreshToken(userId, refreshToken) {
  await queryPUT(tb_m_users, { refreshToken: refreshToken }, `WHERE user_id = ${userId}`);
}

async function deleteStoredRefreshToken(userId) {
  await queryPUT(tb_m_users, { refreshToken: null }, `WHERE user_id = ${userId}`);
}

module.exports = {
  saveRefreshToken,
  getStoredRefreshToken,
  deleteStoredRefreshToken,
  generateToken: async (payload) => {
    // Wajib menyertakan userId dan username agar token bisa digunakan untuk otentikasi
    const token = jwt.sign(
      {
        user_id: payload.id,
        username: payload.username,
        fullname: payload.fullname,
        email: payload.email,
        created_by: payload.created_by,
        created_dt: payload.created_dt,
        address: payload.address,
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' } // 1 menit access token
    );
    return token;
  },

  generateRefreshToken: async (user) => {
    const refreshToken = jwt.sign(
      { userId: user.id ?? user.user_id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );
  
    const userId = user.id ?? user.user_id;
    if (!userId) throw new Error("Missing user id for refresh token saving");
  
    await queryPUT(tb_m_users, { refreshToken: refreshToken }, `WHERE user_id = ${userId}`);
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
