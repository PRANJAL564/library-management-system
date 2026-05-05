const db = require("../config/db");

exports.getBookQuantity = (book_id, callback) => {
    db.query(
        "SELECT quantity FROM books WHERE id = ?",
        [book_id],
        callback
    );
};exports.checkAlreadyIssued = (user_id, book_id, callback) => {
    db.query(
        "SELECT * FROM issued_books WHERE user_id=? AND book_id=? AND status='issued'",
        [user_id, book_id],
        callback
    );
};exports.issueBook = (user_id, book_id, callback) => {
    db.query(
        `INSERT INTO issued_books 
        (user_id, book_id, issue_date, due_date, status) 
        VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'issued')`,
        [user_id, book_id],
        callback
    );
};
exports.decreaseQuantity = (book_id, callback) => {
    db.query(
        "UPDATE books SET quantity = quantity - 1 WHERE id=?",
        [book_id],
        callback
    );
};
exports.getIssueById = (id, callback) => {
    db.query(
        "SELECT book_id, due_date FROM issued_books WHERE id=?",
        [id],
        callback
    );
};
exports.updateReturnAndFine = (id, fine, callback) => {
    db.query(
        `UPDATE issued_books 
         SET return_date = CURDATE(),
             status = 'returned',
             fine = ?
         WHERE id = ?`,
        [fine, id],
        callback
    );
};
exports.increaseQuantity = (book_id, callback) => {
    db.query(
        "UPDATE books SET quantity = quantity + 1 WHERE id=?",
        [book_id],
        callback
    );
};
exports.getUserIssuedBooks = (user_id, callback) => {
    db.query(
        `SELECT 
            issued_books.id,
            books.title,
            books.author,
            issued_books.issue_date,
            issued_books.due_date,
            issued_books.status
         FROM issued_books
         JOIN books ON issued_books.book_id = books.id
         WHERE issued_books.user_id = ? AND issued_books.status = 'issued'`,
        [user_id],
        callback
    );
};
exports.getUserFine = (user_id, callback) => {
    db.query(
        `SELECT SUM(fine) AS totalFine 
         FROM issued_books 
         WHERE user_id = ?`,
        [user_id],
        callback
    );
};