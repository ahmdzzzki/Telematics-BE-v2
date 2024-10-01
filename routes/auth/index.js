const router = require("express").Router();
const auth = require("../../controllers/auth/auth.controllers");
const { preventSqlInjection } = require("../../middleware/sqlInjection");

router.post("/login", auth.login);
router.post("/register", preventSqlInjection, auth.register);

module.exports = router;
