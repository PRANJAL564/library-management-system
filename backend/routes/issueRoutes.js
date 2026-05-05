const express = require("express");
const router = express.Router();
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", issueController.issueBook);
router.put("/return/:id", issueController.returnBook);
router.get(
    "/my",
    authMiddleware.verifyToken,
    issueController.getMyIssuedBooks
);
router.get(
    "/fine",
    authMiddleware.verifyToken,
    issueController.getMyFine
);
module.exports = router;