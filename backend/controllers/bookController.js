const Book = require("../models/bookModel");

exports.getBooks = (req, res) => {
    Book.getAllBooks((err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};
exports.createBook = (req, res) => {
    const { title, author, quantity } = req.body;

    if (!title || !author || !quantity) {
        return res.status(400).send("All fields required");
    }

    Book.addBook(req.body, (err, result) => {
        if (err) return res.status(500).send(err);

        res.send("Book Added Successfully");
    });
};
exports.updateBook = (req, res) => {
    const id = req.params.id;

    Book.updateBook(id, req.body, (err, result) => {
        if (err) return res.status(500).send(err);

        res.send("Book Updated ");
    });
};
exports.deleteBook = (req, res) => {
    const id = req.params.id;

    Book.deleteBook(id, (err, result) => {
        if (err) return res.status(500).send(err);

        res.send("Book Deleted ");
    });
};
exports.searchBooks = (req, res) => {
    const { title } = req.query;

    Book.searchBooks(title, (err, results) => {
        if (err) return res.status(500).send(err);

        res.json(results);
    });
};
exports.getBookById = (req, res) => {
    const id = req.params.id;

    Book.getBookById(id, (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(404).send("Book not found ");
        }

        res.json(results[0]);
    });
};