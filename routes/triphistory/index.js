const {
    addTripHistory,
    getTripHistoryByTripId,
    getTripHistoryByVin
} = require("../../controllers/trip-history/tripHistory.controllers");
const { verifyToken } = require("../../middleware/auth");

const router = require("express").Router();

router.post("/", verifyToken, addTripHistory);
router.get("/getByVin/:vehicle_id/getByTripId/:trip_id", verifyToken, getTripHistoryByTripId);
router.get("/getByVin/:vehicle_id", verifyToken, getTripHistoryByVin);

module.exports = router;
