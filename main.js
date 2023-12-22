// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const querystring = require("querystring");

const app = express();
const PORT = process.env.PORT || 4000;

// Database Connections
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
db.once("open", () => {
  console.log("Connected to the Database");
});

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

//Storing session information
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

//Set Template Engine
app.set("view engine", "ejs");

//route Prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
