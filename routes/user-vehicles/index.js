const router = require("express").Router();
const {
  userVehicleInfo,
  connectVehicle,
  registerVisitor,
  deleteVisitor,
  recordVisitorActivity,
  editVisitor,
  getRecordVisitorActivity
} = require("../../controllers/user-vehicles/userVehicles.controllers");
const { verifyToken } = require("../../middleware/auth");

router.get("/informations", verifyToken, userVehicleInfo);
router.post("/connect", verifyToken, connectVehicle);

router.post("/visitor", registerVisitor);
router.delete("/visitor", deleteVisitor);
router.put("/visitor", editVisitor);

router.post("/visitor/activity", recordVisitorActivity);
router.get("/visitor/activity", getRecordVisitorActivity);


module.exports = router;
