const {
  addVehicle,
  getVehicles,
  addVehicleStatus,
  getVehicleStatus,
  getMaintenanceConfig,
  submitServiceInformation,
  getServiceHistory,
  updateServiceInformation,
  deleteServiceHistory,
  getLastPartMaintenance,
  getLatestOdoMeter,
} = require("../../controllers/vehicles/vehicles.controllers");
const { verifyToken } = require("../../middleware/auth");

const router = require("express").Router();

router.get("/get", verifyToken, getVehicles);
router.get("/get/:vin", verifyToken, getVehicles);
router.post("/add", verifyToken, addVehicle);
router.post("/status", addVehicleStatus);
router.get("/status", getVehicleStatus);
router.post("/service_history", submitServiceInformation);
router.get("/service_history/:vin", verifyToken, getServiceHistory);
router.put(
  "/service_history/:service_id",
  verifyToken,
  updateServiceInformation
);
router.delete("/service_history/:service_id", deleteServiceHistory);
router.get("/service_history/latest_maintenance/:vin", getLastPartMaintenance);
router.get("/odometer", getLatestOdoMeter);

module.exports = router;
