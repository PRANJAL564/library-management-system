const db = require("../config/db");

exports.createUser = (user, callback) => {
    const { name, email, password, role } = user;

    db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role],
        callback
    );
};
exports.findUserByEmail = (email, callback) => {
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        callback
    );
};
exports.getAllUsers = (callback) => {
    db.query(
        `SELECT u.id, u.name, u.email, u.role, IFNULL(SUM(ib.fine), 0) AS totalFine 
         FROM users u 
         LEFT JOIN issued_books ib ON u.id = ib.user_id 
         GROUP BY u.id`,
        callback
    );
};

exports.deleteUser = (id, callback) => {
    db.query("DELETE FROM users WHERE id = ?", [id], callback);
};