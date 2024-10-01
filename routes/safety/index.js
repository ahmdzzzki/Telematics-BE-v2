const {
  getHistoricalDrow,
} = require("../../controllers/safety/safety.controllers");
const router = require("express").Router();
const auth = require("../../middleware/auth");

router.get("/get/:vehicle_id", auth.verifyToken, getHistoricalDrow);

module.exports = router;
