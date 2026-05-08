const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
   origin: "https://library-management-system-kappa-lovat.vercel.app/"
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Library API Running 🚀");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
const bookRoutes = require("./routes/bookRoutes");

app.use("/books", bookRoutes);

const userRoutes = require("./routes/userRoutes");

app.use("/users", userRoutes);

const issueRoutes = require("./routes/issueRoutes");

app.use("/issue", issueRoutes);

//localhost:PORT/api/v1

const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/dashboard", dashboardRoutes);