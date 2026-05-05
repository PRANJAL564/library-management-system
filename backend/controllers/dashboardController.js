const Dashboard = require("../models/dashboardModel");

exports.getDashboard = (req, res) => {
    Dashboard.getTotalBooks((err, books) => {
        if (err) return res.status(500).send(err);

        Dashboard.getTotalUsers((err, users) => {
            if (err) return res.status(500).send(err);

            Dashboard.getIssuedBooks((err, issued) => {
                if (err) return res.status(500).send(err);

                Dashboard.getReturnedBooks((err, returned) => {
                    if (err) return res.status(500).send(err);

                    Dashboard.getTotalFine((err, fine) => {
                        if (err) return res.status(500).send(err);

                        res.json({
                            totalBooks: books[0].totalBooks,
                            totalUsers: users[0].totalUsers,
                            issuedBooks: issued[0].issuedBooks,
                            returnedBooks: returned[0].returnedBooks,
                            totalFine: fine[0].totalFine || 0
                        });
                    });
                });
            });
        });
    });
};