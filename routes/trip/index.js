const {
    addTripHistory,
    getTripHistory,
    getLatestTripId,
    getLatestLocationByVin,
} = require("../../controllers/trip/trip.controllers");
const { verifyToken } = require("../../middleware/auth");

const router = require("express").Router();

router.post("/", verifyToken, addTripHistory);
router.get("/", verifyToken, getTripHistory);
router.get("/latest", verifyToken, getLatestTripId);
router.get("/:trip_id", verifyToken, getTripHistory);
router.get("/latestLocationByVin/:vehicle_id", verifyToken, getLatestLocationByVin);

module.exports = router;
