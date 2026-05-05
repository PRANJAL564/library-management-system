const db = require("../config/db");
const Issue = require("../models/issueModel");

exports.issueBook = (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).send("All fields required ❌");
    }

    // 🔥 1. Start transaction
    db.beginTransaction((err) => {
        if (err) return res.status(500).send(err);

        // 🔹 Check quantity
        Issue.getBookQuantity(book_id, (err, result) => {
            if (err) return db.rollback(() => res.status(500).send(err));

            if (result.length === 0 || result[0].quantity <= 0) {
                return db.rollback(() => res.status(400).send("Book not available ❌"));
            }

            // 🔹 Check already issued
            Issue.checkAlreadyIssued(user_id, book_id, (err, rows) => {
                if (err) return db.rollback(() => res.status(500).send(err));

                if (rows.length > 0) {
                    return db.rollback(() => res.status(400).send("Already issued ❌"));
                }

                // 🔹 Insert issue
                Issue.issueBook(user_id, book_id, (err) => {
                    if (err) return db.rollback(() => res.status(500).send(err));

                    // 🔹 Update quantity
                    Issue.decreaseQuantity(book_id, (err) => {
                        if (err) return db.rollback(() => res.status(500).send(err));

                        // 🔥 2. Commit
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => res.status(500).send(err));
                            }

                            res.send("Book Issued Successfully 📚");
                        });
                    });
                });
            });
        });
    });
};
exports.returnBook = (req, res) => {
    const id = req.params.id;

    db.beginTransaction((err) => {
        if (err) return res.status(500).send(err);

        Issue.getIssueById(id, (err, result) => {
            if (err) return db.rollback(() => res.status(500).send(err));

            if (result.length === 0) {
                return db.rollback(() => res.status(404).send("Record not found ❌"));
            }

            const { book_id, due_date } = result[0];

            const fine = calculateFine(due_date);

            Issue.updateReturnAndFine(id, fine, (err) => {
                if (err) return db.rollback(() => res.status(500).send(err));

                Issue.increaseQuantity(book_id, (err) => {
                    if (err) return db.rollback(() => res.status(500).send(err));

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => res.status(500).send(err));
                        }

                        res.json({
                            message: "Book Returned ✅",
                            fine: fine
                        });
                    });
                });
            });
        });
    });
};
const calculateFine = (due_date) => {
    const today = new Date();
    const due = new Date(due_date);

    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
        return diffDays * 5;
    }

    return 0;
};
exports.getMyIssuedBooks = (req, res) => {
    const user_id = req.user.id; // 🔥 token se aayega

    Issue.getUserIssuedBooks(user_id, (err, result) => {
        if (err) return res.status(500).send(err);

        res.json(result);
    });
};
exports.getMyFine = (req, res) => {
    const user_id = req.user.id; // 🔥 token se

    Issue.getUserFine(user_id, (err, result) => {
        if (err) return res.status(500).send(err);

        res.json({
            totalFine: result[0].totalFine || 0
        });
    });
};