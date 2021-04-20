require('dotenv').config() // dotenv pkg always at top.

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption"); // level2 encryption package
//const md5 = require("md5"); // level 3 :hashing function package
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize()); // initialise passport
app.use(passport.session()); // tell passport to use session

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret = process.env.SECRET;
// encryptedField contains array of fields that r to be encrypted.
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    // cookie has info of our logged in, so authenticate
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else { // if we access /secrets in new browser or icognito without login, it will show these
        res.redirect("/login");
    }
});

app.get("/logout", (req,res)=>{
    req.logout();       // to deauthenticate
    res.redirect("/");
});

app.post("/register", (req, res) => {


    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            // if succesfull registeration, then authenticate that user
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    })

});

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    })
});

app.listen(3000, () => {
    console.log("server started at 3000");
})