const { queryPOST, queryGET, queryDELETE } = require("../../helpers/query");
const { tb_r_health_report } = require("../../config/tables"); // table baru
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

  getHealthReportByDate: async (req, res) => {
    try {
        const { date } = req.query;
        console.log(`[BACKEND] Incoming Request for Health Reports on Date: ${date}`);

        if (!date) {
            return response.badRequest(res, "Tanggal harus diberikan");
        }

        // Konversi ke format YYYY-MM-DD untuk keamanan
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return response.badRequest(res, "Format tanggal tidak valid");
        }
        const formattedDate = parsedDate.toISOString().split('T')[0];
        
        // Pastikan whereCond dalam bentuk string yang benar
        const whereCond = `WHERE DATE(time) = '${formattedDate}'`;

        console.log(`[BACKEND] Executing Query: SELECT * FROM tb_r_health_report ${whereCond}`);

        let healthReportData = await queryGET(tb_r_health_report, whereCond);

        console.log(`[BACKEND] Query Result: ${healthReportData.length} records found`);

        return response.success(res, healthReportData);
    } catch (error) {
        console.error("[BACKEND] Error fetching health report:", error);
        return response.error(res, "Gagal mengambil data laporan kesehatan");
    }
  },



  // Controller untuk menambahkan data health report
  addHealthReportData: async (req, res) => {
    try {
      const healthReport = req.body;

      // Validasi data yang diperlukan
      // (!healthReport.user_id || !healthReport.time || !healthReport.trip_history_id)
      if (!healthReport.user_id) {
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
