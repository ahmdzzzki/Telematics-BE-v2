const { tb_m_users } = require("../../config/tables");
const { encrypt, decrypt } = require("../../helpers/security");
const { queryPOST, queryGET } = require("../../helpers/query");
const response = require("../../helpers/response");
const { generateToken } = require("../../middleware/auth");

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
        response.success(res, {
          token: token,
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
};
