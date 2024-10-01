const {
    addCamera,
    getCameraByVin,
} = require("../../controllers/camera/camera.controllers");
const { verifyToken } = require("../../middleware/auth");

const router = require("express").Router();

router.post("/", verifyToken, addCamera);
router.get("/getByVin/:vehicle_id", verifyToken, getCameraByVin);

module.exports = router;
