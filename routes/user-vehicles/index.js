const router = require("express").Router();
const {
  userVehicleInfo,
  connectVehicle,
  registerVisitor,
  deleteVisitor,
  recordVisitorActivity,
  editVisitorName
} = require("../../controllers/user-vehicles/userVehicles.controllers");
const { verifyToken } = require("../../middleware/auth");

router.get("/informations", verifyToken, userVehicleInfo);
router.post("/connect", verifyToken, connectVehicle);

router.post("/register", registerVisitor);
router.delete("/remove/:key_access", deleteVisitor);
router.post("/activity", recordVisitorActivity);
router.put("/edit", editVisitorName);

module.exports = router;
