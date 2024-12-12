const {
  tb_m_user_vehicle,
  tb_m_users,
  tb_m_vehicle,
  tb_m_visitor,
  tb_r_visitor_activity
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

  registerVisitor: async (req, res) => {
    try {
      const { key_access, visitor_name, vehicle_id } = req.body;
  
      // Validasi input
      if (!key_access || !visitor_name) {
        return response.error(res, "Key Access and Visitor Name are required", 400);
      }
  
      // Periksa apakah key_access sudah ada
      const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE key_access = '${key_access}'`;
      const existingVisitor = await queryCustom(checkQuery);
  
      if (existingVisitor.length > 0) {
        return response.error(res, "Key Access already exists", 409);
      }
  
      // Insert data visitor
      const visitorData = { key_access, visitor_name, vehicle_id };
      await queryPOST(tb_m_visitor, visitorData);
  
      response.success(res, "Visitor registered successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },
  
  deleteVisitor: async (req, res) => {
    try {
      const { key_access } = req.params;
  
      // Validasi input
      if (!key_access) {
        return response.error(res, "Key Access is required", 400);
      }
  
      // Periksa apakah key_access ada
      const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE key_access = '${key_access}'`;
      const existingVisitor = await queryCustom(checkQuery);
  
      if (existingVisitor.length === 0) {
        return response.error(res, "Visitor not found", 404);
      }
  
      // Hapus data visitor
      const deleteQuery = `DELETE FROM ${tb_m_visitor} WHERE key_access = '${key_access}'`;
      await queryCustom(deleteQuery);
  
      response.success(res, "Visitor deleted successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },

  recordVisitorActivity: async (req, res) => {
    try {
      const { key_access, latitude, longitude, altitude } = req.body;
  
      // Validasi input
      if (!key_access) {
        return response.error(res, "Key Access is required", 400);
      }
  
      // Periksa apakah key_access ada
      const checkQuery = `SELECT * FROM ${tb_m_visitor} WHERE key_access = '${key_access}'`;
      const existingVisitor = await queryCustom(checkQuery);
  
      if (existingVisitor.length === 0) {
        return response.error(res, "Visitor not found", 404);
      }
  
      // Insert aktivitas absen
      const activityData = {
        key_access,
        visitor_name: existingVisitor[0].visitor_name,
        latitude,
        longitude,
        altitude,
      };
      await queryPOST(tb_r_visitor_activity, activityData);
  
      response.success(res, "Visitor activity recorded successfully");
    } catch (error) {
      console.error(error);
      response.error(res, "Internal server error");
    }
  },

  editVisitorName: async (req, res) => {
    try {
      let { key_access, new_visitor_name } = req.body;
      // Verifikasi apakah `new_visitor_name` tidak undefined atau null
      if (!new_visitor_name) {
        return response.error(res, "Visitor name is required");
      }
      let updateQuery = `UPDATE ${tb_m_visitor} SET visitor_name = '${new_visitor_name}' WHERE key_access = '${key_access}'`;
      let result = await queryCustom(updateQuery);
  
      if (result.affectedRows > 0) {
        response.success(res, "Visitor name updated successfully");
      } else {
        response.error(res, "Failed to update visitor name");
      }
    } catch (error) {
      response.error(res, error);
    }
  },
  
};
