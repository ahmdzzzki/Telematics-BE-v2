const { queryPOST, queryGET, queryDELETE } = require("../../helpers/query");
const { tb_r_health_report } = require("../../config/tables");
const response = require("../../helpers/response");

module.exports = {
  // Controller untuk mendapatkan data health report
  getHealthReportData: async (req, res) => {
    try {
      let healthReportData = await queryGET(tb_r_health_report);  // Mengambil semua data health report
      response.success(res, healthReportData);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  // Controller untuk menambahkan data health report
  addHealthReportData: async (req, res) => {
    try {
      const healthReport = req.body;

      // Validasi data yang diperlukan
      if (!healthReport.user_id || !healthReport.time || !healthReport.trip_history_id) {
        return response.badRequest(res, "User ID, Time, and Trip History ID are required");
      }

      // Menambahkan data ke dalam database
      await queryPOST(tb_r_health_report, healthReport);
      response.success(res, "Health report data successfully added");
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },

  // Controller untuk menghapus data health report berdasarkan health_report_id
  deleteHealthReportData: async (req, res) => {
    try {
      const { health_report_id } = req.params;

      if (!health_report_id) {
        return response.badRequest(res, "Health Report ID is required");
      }

      // Menghapus data dari database berdasarkan health_report_id
      await queryDELETE(tb_r_health_report, `WHERE health_report_id = ${health_report_id}`);
      response.success(res, `Health report with ID ${health_report_id} successfully deleted`);
    } catch (error) {
      console.log(error);
      response.error(res, error);
    }
  },
};
