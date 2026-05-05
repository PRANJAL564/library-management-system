const db = require("../config/db");

// Total books
exports.getTotalBooks = (callback) => {
    db.query("SELECT COUNT(*) AS totalBooks FROM books", callback);
};

// Total users
exports.getTotalUsers = (callback) => {
    db.query("SELECT COUNT(*) AS totalUsers FROM users", callback);
};

// Issued books
exports.getIssuedBooks = (callback) => {
    db.query(
        "SELECT COUNT(*) AS issuedBooks FROM issued_books WHERE status='issued'",
        callback
    );
};

// Returned books
exports.getReturnedBooks = (callback) => {
    db.query(
        "SELECT COUNT(*) AS returnedBooks FROM issued_books WHERE status='returned'",
        callback
    );
};

// Total fine
exports.getTotalFine = (callback) => {
    db.query(
        "SELECT SUM(fine) AS totalFine FROM issued_books",
        callback
    );
};