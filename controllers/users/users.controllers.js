const { tb_m_users } = require("../../config/tables");
const { queryGET, queryPOST, queryPUT, queryCustom } = require("../../helpers/query");
const response = require("../../helpers/response");
const { encrypt } = require("../../helpers/security");

module.exports = {
  getUsers: async (req, res) => {
    try {
      console.log("the thing is"+req.query.username);
      const username = req.query.username;
      let q = `
        SELECT * FROM ${tb_m_users}
        WHERE username = '${username}';`;
      let userData = await queryCustom(q);
      response.success(res, userData);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  
  postUser: async (req, res) => {
    try {
      let encryptPass = encrypt(req.body.password);
      req.body.password = encryptPass;
      await queryPOST(tb_m_users, req.body);
      response.success(res, "success to add user");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  editUser: async (req, res) => {
    try {
      await queryPUT(
        tb_m_users,
        req.body,
        `WHERE username = '${req.params.username}'`
      );
      response.success(res, "success to edit user");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
};
