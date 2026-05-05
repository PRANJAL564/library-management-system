const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", bookController.getBooks);
// router.post("/", bookController.createBook);
// router.put("/:id", bookController.updateBook);
// router.delete("/:id", bookController.deleteBook);
router.get("/search", bookController.searchBooks);
router.get("/:id", bookController.getBookById);
// router.post("/", authMiddleware.verifyToken, bookController.createBook);

router.post(
    "/",
    authMiddleware.verifyToken,
    roleMiddleware.checkAdmin,
    bookController.createBook
);

router.put(
    "/:id",
    authMiddleware.verifyToken,
    roleMiddleware.checkAdmin,
    bookController.updateBook
);

router.delete(
    "/:id",
    authMiddleware.verifyToken,
    roleMiddleware.checkAdmin,
    bookController.deleteBook
);
module.exports = router;