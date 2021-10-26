require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.ADMINPATH, { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("Login");
});

app.route("/login")
    .get(
        function (req, res) {
            res.render("Login");
        })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ email: username }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        if (result === true) {
                            res.render('secrets');
                        }
                    });
                }
            }
        });
    });

app.route("/register")
    .get(function (req, res) {
        res.render("Register")
    })
    .post(function (req, res) {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });

            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('secrets');
                }
            });
        });
    });

let port = process.env.PORT;

if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log('Server has Started on port: ' + port);
});
