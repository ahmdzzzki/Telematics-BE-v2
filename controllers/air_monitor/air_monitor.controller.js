const { queryPOST, queryGET, queryDELETE } = require("../../helpers/query");
const { tb_r_air_condition } = require("../../config/tables");
const response = require("../../helpers/response");

module.exports = {
  // Controller untuk mendapatkan data kondisi udara
  getAirConditionData: async (req, res) => {
    try {
      let airConditionData = await queryGET(tb_r_air_condition);  // Ambil semua data
      response.success(res, airConditionData);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  // Controller untuk menambahkan data kondisi udara
  addAirConditionData: async (req, res) => {
    try {
      const airCondition = req.body;

      // Pastikan semua field yang diperlukan ada dalam request
      // if (!airCondition.vehicle_id || !airCondition.created_time || !airCondition.created_dt) {
      //   return response.badRequest(res, "Vehicle ID, Created Time, and Created Date are required");
      // }

      await queryPOST(tb_r_air_condition, airCondition); // Masukkan data ke database
      response.success(res, "Air condition data successfully added");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  // Controller untuk menghapus data kondisi udara berdasarkan ID
  deleteAirConditionData: async (req, res) => {
    try {
      const { air_condition_id } = req.params;

      if (!air_condition_id) {
        return response.badRequest(res, "Air Condition ID is required");
      }

      await queryDELETE(tb_r_air_condition, `WHERE air_condition_id = ${air_condition_id}`);
      response.success(res, `Air condition data with ID ${air_condition_id} successfully deleted`);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
};
