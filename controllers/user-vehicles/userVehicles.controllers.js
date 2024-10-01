const {
  tb_m_user_vehicle,
  tb_m_users,
  tb_m_vehicle,
} = require("../../config/tables");
const { queryGET, queryPOST, queryCustom } = require("../../helpers/query");
const response = require("../../helpers/response");

module.exports = {
  userVehicleInfo: async (req, res) => {
    try {
      console.log(req.params.username);
      let q = `
      SELECT
        *
      FROM ${tb_m_user_vehicle} tmuv
      JOIN ${tb_m_vehicle} tmv ON tmv.vehicle_id = tmuv.vehicle_id
      WHERE username = '${req.user.username}'`;
      let vehicles = await queryCustom(q);
      let resObj = {
        user: req.user.username,
        vehicles,
      };
      response.success(res, resObj);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
  connectVehicle: async (req, res) => {
    try {
      console.log(req.user);
      let q = `SELECT * FROM ${tb_m_vehicle} WHERE vehicle_id = '${req.body.vehicle_id}' AND username = '${req.user.username}'`;
      if (q[0] != null) {
        response.success(res, "vehicle already connected");
      } else {
        let insertedData = {
          username: req.user.username,
          vehicle_id: req.body.vehicle_id,
          created_by: req.user.username,
        };
        await queryPOST(tb_m_user_vehicle, insertedData);
        response.success(res, "Success to connect vehicle");
      }
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

};
