const response = require("../helpers/response");

const router = require("express").Router();
const fs = require("fs");

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/user-vehicle", require("./user-vehicles"));
router.use("/safety", require("./safety"));
router.use("/vehicles", require("./vehicles"));
router.use("/geofencing", require("./geofencing"));
router.use("/trip", require("./trip"));
router.use("/trip_history", require("./triphistory"));
router.use("/camera", require("./camera"));

router.get("/image", (req, res) => {
  try {
    // start deploy
    // http://103.190.28.211:3000/api/v1
    const path = req.query.path;

    fs.createReadStream(path).pipe(res);
  } catch (error) {
    console.log(error);
    response.error(res, "failed to get images");
  }
});

module.exports = router;
