const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    User.createUser(
        { name, email, password: hashedPassword, role: role || "user" },
        (err) => {
            if (err) return res.status(500).send(err);

            res.send("User Registered ✅");
        }
    );
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findUserByEmail(email, async (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(404).send("User not found ❌");
        }

        const user = results[0];

        // password match karo
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Invalid password ❌");
        }

        // token generate
       const token = jwt.sign({ id: user.id, role: user.role, email: user.email },process.env.JWT_SECRET,{ 
        expiresIn: "1h" }
);

        res.json({ message: "Login successful ✅", token });
    });
};

exports.getAllUsers = (req, res) => {
    User.getAllUsers((err, results) => {
        if (err) return res.status(500).send(err);

        res.json(results);
    });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    User.deleteUser(id, (err, result) => {
        if (err) {
            // Check for foreign key constraint error
            if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
                return res.status(400).send("Cannot delete user because they have issued books.");
            }
            return res.status(500).send(err);
        }
        res.send("User Deleted Successfully ✅");
    });
};