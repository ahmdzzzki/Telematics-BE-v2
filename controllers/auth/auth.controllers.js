const { tb_m_users } = require("../../config/tables");
const { encrypt, decrypt } = require("../../helpers/security");
const { queryPOST, queryGET } = require("../../helpers/query");
const response = require("../../helpers/response");
const {
  saveRefreshToken,
  getStoredRefreshToken,
  deleteStoredRefreshToken
} = require("../../middleware/auth"); 
const { generateToken, generateRefreshToken,} = require("../../middleware/auth");

const jwt = require("jsonwebtoken");

module.exports = {
  login: async (req, res) => {
    try {
      let findUserData = await queryGET(
        tb_m_users,
        `WHERE username = '${req.body.username}'`
      );

      let is_correct = decrypt(findUserData[0].password) == req.body.password;
      if (is_correct) {
        let token = await generateToken(findUserData[0]);
        let refreshToken = await generateRefreshToken(findUserData[0]);
        response.success(res, {
          token: token,
          refreshToken: refreshToken,
          user: findUserData[0]
        });
      } else {
        response.unauthorized(res, "Your username / password wrong");
      }
    } catch (error) {
      console.log(error);

      response.error(res, error);
    }
  },

  register: async (req, res) => {
    try {
      let encryptPass = await encrypt(req.body.password);
      req.body.password = encryptPass;
      await queryPOST(tb_m_users, req.body);

      response.success(res, "success to register");
    } catch (error) {
      response.error(res, error);
    }
  },

  // refreshToken: async (req, res) => {  
  //   const { refreshToken } = req.body;  
    
  //   if (!refreshToken) {  
  //     return response.unauthorized(res, "Refresh token is required");  
  //   }  
    
  //   try {  
  //     // Verifikasi refresh token  
  //     const userData = jwt.verify(refreshToken, process.env.SECRET_KEY);  
        
  //     // Cek apakah refresh token valid dan ada di database  
  //     const storedRefreshToken = await getStoredRefreshToken(userData.userId); // Implementasikan fungsi ini  
  //     if (!storedRefreshToken || storedRefreshToken !== refreshToken) {  
  //       return response.unauthorized(res, "Invalid refresh token");  
  //     }  
    
  //     // Jika valid, buat token akses baru  
  //     const newAccessToken = await generateToken({ userId: userData.userId });  
  //     response.success(res, { accessToken: newAccessToken });  
  //   } catch (error) {  
  //     console.log(error);  
  //     response.unauthorized(res, "Invalid refresh token");  
  //   }  
  // },  

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return response.unauthorized(res, "Refresh token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);

      // Ambil dari DB berdasarkan userId
      const storedRefreshToken = await getStoredRefreshToken(decoded.userId);
      if (storedRefreshToken !== refreshToken) {
        return response.unauthorized(res, "Invalid or expired refresh token");
      }

      // Ambil user
      const userList = await queryGET(tb_m_users, `WHERE user_id = ${decoded.userId}`);
      const user = userList[0];
      if (!user) return response.unauthorized(res, "User not found");

      const newAccessToken = await generateToken(user);
      const newRefreshToken = await generateRefreshToken(user);

      return response.success(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      console.log("❌ Error refreshing token:", err);
      return response.unauthorized(res, "Invalid or expired refresh token");
    }
  },



  logout: async (req, res) => {  
    const userId = req.user.id; // Ambil user ID dari request  
    await deleteStoredRefreshToken(userId); // Hapus refresh token dari penyimpanan  
    // Jika Anda menyimpan token akses di database, hapus juga di sini  
    response.success(res, "Successfully logged out");  
  },  
};
