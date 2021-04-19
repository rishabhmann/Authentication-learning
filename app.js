const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);




app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if (err)
            res.send(err);
        else

            res.render("secrets");
    });
});

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: username
    }, function (err, foundUser) {
        if (err)
            console.log(err);
        else {
            if (foundUser) {
                if (foundUser.password === password)
                    res.render("secrets");
                else
                    res.send("You have type Incorrect Password!! Please Enter Correct Password");
            } else
                res.send("You haven't Registered Yet, Please register at " + __dirname + "/register");
        }
    });
});

app.listen(3000, () => {
    console.log("server started at 3000");
})