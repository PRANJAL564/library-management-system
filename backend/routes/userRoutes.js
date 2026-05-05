const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware.verifyToken,
    roleMiddleware.checkAdmin,
    userController.getAllUsers
);

router.delete(
    "/:id",
    authMiddleware.verifyToken,
    roleMiddleware.checkAdmin,
    userController.deleteUser
);

module.exports = router;