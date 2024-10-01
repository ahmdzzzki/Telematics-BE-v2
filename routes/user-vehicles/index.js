const router = require("express").Router();
const {
  userVehicleInfo,
  connectVehicle,
} = require("../../controllers/user-vehicles/userVehicles.controllers");
const { verifyToken } = require("../../middleware/auth");

router.get("/informations", verifyToken, userVehicleInfo);
router.post("/connect", verifyToken, connectVehicle);

module.exports = router;
