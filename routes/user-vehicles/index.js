const router = require("express").Router();
const {
  userVehicleInfo,
  connectVehicle,

  // Visitor
  registerVisitor,
  getVisitorByVehicleId,
  deleteVisitor,
  editVisitor,
  deleteVisitorByName,

  // Visitor Activity
  recordVisitorActivity,
  getRecordVisitorActivity,

  // Key Access
  registerVisitorKeyAccesstoDB,
  getKeyByVisitorId,
  deleteKeyById
} = require("../../controllers/user-vehicles/userVehicles.controllers");

const { verifyToken } = require("../../middleware/auth");

// Vehicle
router.get("/informations", verifyToken, userVehicleInfo);
router.post("/connect", verifyToken, connectVehicle);

// Visitor
router.post("/user-vehicles/visitor", registerVisitor);
router.get("/visitor/:vehicle_id", getVisitorByVehicleId);
router.delete("/visitor/:visitor_id", deleteVisitor);
router.put("/visitor", editVisitor);
router.delete("/visitor/name/:visitor_name", deleteVisitorByName);

// Visitor Activity
router.post("/visitor/activity", recordVisitorActivity);
router.get("/visitor/activity/:vehicle_id", getRecordVisitorActivity);

// Key Access
router.post("/key/save", registerVisitorKeyAccesstoDB);
// router.get("/key/:visitor_id", getKeyByVisitorId);
router.delete("/key/:key_id", deleteKeyById);


module.exports = router;
