const db = require("../config/db");

exports.getAllBooks = (callback) => {
    db.query("SELECT * FROM books", callback);
};
exports.addBook = (book, callback) => {
    const { title, author, quantity } = book;
    db.query(
        "INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)",
        [title, author, quantity],
        callback
    );
};
exports.updateBook = (id, book, callback) => {
    const { title, author, quantity } = book;

    db.query(
        "UPDATE books SET title=?, author=?, quantity=? WHERE id=?",
        [title, author, quantity, id],
        callback
    );
};
exports.deleteBook = (id, callback) => {
    db.query("DELETE FROM books WHERE id=?", [id], callback);
};
exports.searchBooks = (title, callback) => {
    db.query(
        "SELECT * FROM books WHERE title LIKE ?",
        [`%${title}%`],
        callback
    );
};
exports.getBookById = (id, callback) => {
    db.query(
        "SELECT * FROM books WHERE id = ?",
        [id],
        callback
    );
};