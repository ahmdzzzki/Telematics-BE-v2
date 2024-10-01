const {
  addFencingArea,
  getFencingArea,
  updateFencingArea,
  deleteFencingArea,
} = require("../../controllers/geofancing/geofencing.controllers");
const { verifyToken } = require("../../middleware/auth");
const router = require("express").Router();

router.post("/", verifyToken, addFencingArea);
router.get("/", verifyToken, getFencingArea);
router.put("/:geo_id", verifyToken, updateFencingArea);
router.delete("/:geo_id", verifyToken, deleteFencingArea);

module.exports = router;
