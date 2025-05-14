const { queryPOST, queryGET, queryDELETE } = require("../../helpers/query");
const { tb_r_air_condition } = require("../../config/tables");
const response = require("../../helpers/response");

module.exports = {
  // Controller untuk mendapatkan semua data kondisi udara
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

  // Controller untuk mendapatkan data kondisi udara berdasarkan tanggal
  getAirQualityByDate: async (req, res) => {
    try {
        const { date } = req.query;
        console.log(`[BACKEND] Incoming Request for Air Quality Reports on Date: ${date}`);

        if (!date) {
            return response.badRequest(res, "Tanggal harus diberikan");
        }

        // Konversi ke format YYYY-MM-DD untuk keamanan
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return response.badRequest(res, "Format tanggal tidak valid");
        }
        const formattedDate = parsedDate.toISOString().split('T')[0];
        
        // Query mengambil semua kolom dari tabel
        const whereCond = `WHERE DATE(created_dt) = '${formattedDate}'`;

        console.log(`[BACKEND] Executing Query: SELECT * FROM tb_r_air_condition ${whereCond}`);

        let airQualityData = await queryGET(tb_r_air_condition, whereCond);

        console.log(`[BACKEND] Query Result: ${airQualityData.length} records found`);

        return response.success(res, airQualityData);
    } catch (error) {
        console.error("[BACKEND] Error fetching air quality report:", error);
        return response.error(res, "Gagal mengambil data laporan kualitas udara");
    }
  },
};
