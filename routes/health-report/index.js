const express = require("express");
const router = express.Router();
const {
    getHealthReportData, 
    addHealthReportData,
    deleteHealthReportData,
    getHealthReportByDate, 
} = require("../../controllers/health-report/health.controllers");

router.get("/", getHealthReportData); // Endpoint untuk mengambil data health report
router.post("/", addHealthReportData); // Endpoint untuk menambahkan data health report
router.delete("/:health_report_id", deleteHealthReportData); // Endpoint untuk menghapus data berdasarkan health_report_id

router.get("/by-date", getHealthReportByDate); // Mendapatkan data berdasarkan tanggal

module.exports = router;