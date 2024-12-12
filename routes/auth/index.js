const router = require("express").Router();
const auth = require("../../controllers/auth/auth.controllers");
const { preventSqlInjection } = require("../../middleware/sqlInjection");

router.post("/login", auth.login);
router.post("/register", preventSqlInjection, auth.register);
router.post("/register/RFID", auth.register);
router.post("/register/FG",auth.register);


module.exports = router;
