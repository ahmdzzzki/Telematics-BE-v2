const {
  getUsers,
  postUser,
  editUser,
  // deleteUser,
} = require("../../controllers/users/users.controllers");
const auth = require("../../middleware/auth");
const { preventSqlInjection } = require("../../middleware/sqlInjection");
const router = require("express").Router();

router.get("/get", preventSqlInjection, auth.verifyToken, getUsers);
router.post("/add", preventSqlInjection, auth.verifyToken, postUser);
router.put("/edit/:username", preventSqlInjection, auth.verifyToken, editUser);
// router.delete("/delete/:username", auth.verifyToken, deleteUser);

module.exports = router;
