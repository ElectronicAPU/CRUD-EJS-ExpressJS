const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

//Image Upload Using Multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
  },
});

//Image Upload Middellware
var upload = multer({
  storage: storage,
}).single("image"); //input name

// Insert a user into the Data Base route (POST)
router.post("/add", upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
    });

    await user.save();

    req.session.message = {
      type: "success",
      message: "User added successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

//Get all users route
router.get("/", async (req, res) => {
  try {
    const users = await User.find().exec();
    res.render("index", { title: "Home Page", users: users });
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

//Edit and user routes
router.get("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id);
    console.log(user);
    if (user === null) {
      res.redirect("/");
    } else {
      res.render("edit_user", { title: "edit Page", user: user });
    }
  } catch (error) {
    res.redirect("/");
    res.json({ message: err.message });
  }
});

//Update user route

router.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;

  let new_image = "";
  if (req.file) {
    new_image = req.file.filename;

    try {
      await unlinkAsync("./uploads/" + req.body.old_image);
    } catch (error) {
      console.log(error);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        new_image: new_image, // corrected from req.body.new_image
      },
      { new: true } // to return the updated document
    );

    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" }); // corrected from danger
  }
});

//Delete user route

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;

  try {
    const result = await User.findByIdAndDelete(id);

    if (result && result.image !== "") {
      try {
        await fs.promises.unlink(`./uploads/${result.image}`);
      } catch (error) {
        console.error(error);
      }
    }

    req.session.message = {
      type: "success",
      message: "User deleted successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
