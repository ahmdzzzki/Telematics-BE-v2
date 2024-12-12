const router = require("express").Router();
const { getAirConditionData, addAirConditionData, deleteAirConditionData } = require("../../controllers/air_monitor/air_monitor.controller");

router.get("/get-air", getAirConditionData);  // Endpoint untuk mendapatkan data
router.post("/add-air", addAirConditionData);  // Endpoint untuk menambahkan data
router.delete("/erase-air", deleteAirConditionData);
module.exports = router;