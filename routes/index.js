const response = require("../helpers/response");

const router = require("express").Router();
const fs = require("fs");
const path = require("path");

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/user-vehicle", require("./user-vehicles"));
router.use("/safety", require("./safety"));
router.use("/vehicles", require("./vehicles"));
router.use("/geofencing", require("./geofencing"));
router.use("/trip", require("./trip"));
router.use("/trip_history", require("./triphistory"));
router.use("/camera", require("./camera"));
router.use("/health",require("./health-report"));
router.use("/air-monitor", require("./air_monitor"));

// router.get("/image", (req, res) => {
//   try {
//     // start deploy
//     // http://103.190.28.211:3000/api/v1
//     const path = req.query.path;

//     fs.createReadStream(path).pipe(res);
//   } catch (error) {
//     console.log(error);
//     response.error(res, "failed to get images");
//   }
// });

// New endpoint to serve image from local server
router.get("/image", (req, res) => {
    try {
      const imagePath = req.query.path;
      if (!imagePath) return res.status(400).json({ error: "Path query is required" });
  
      const absolutePath = path.resolve(imagePath);
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: "File not found" });
      }
  
      res.sendFile(absolutePath);
    } catch (error) {
      console.log(error);
      response.error(res, "Failed to get image");
    }
});

module.exports = router;

