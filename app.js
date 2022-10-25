var express = require("express"),
   mongoose = require("mongoose"),
   passport = require("passport"),
   bodyParser = require("body-parser"),
   LocalStrategy = require("passport-local"),
   passportLocalMongoose =
      require("passport-local-mongoose"),
   User = require("./models/user.js");
   

mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.0");

var app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
   secret: "Rusty is a dog",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================

// Showing home page
app.get("/", function (req, res) {
   res.render("home");
});

// Showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
   res.render("secret");
});

// Showing register form
app.get("/register", function (req, res) {
   res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
   var username = req.body.username
   var password = req.body.password
   User.register(new User({ username: username }),
      password, function (err, user) {
         if (err) {
            console.log(err);
            return res.render("register");
         }

         passport.authenticate("local")(
            req, res, function () {
               res.render("secret");
            });
      });
});

//Showing login form
app.get("/login", function (req, res) {
   res.render("login");
});

//Handling user login
app.post("/login", passport.authenticate("local", {
   successRedirect: "/secret",
   failureRedirect: "/login"
}), function (req, res) {
});

//Handling user logout
app.get("/logout", function (req, res) {
   res.redirect("/");
});

app.post('/logout', function(req, res, next){
   req.logout(function(err) {
     if (err) { return next(err); }
     res.redirect('/');
   });
 });

function isLoggedIn(req, res, next) {
   if (req.isAuthenticated()) return next();
   res.redirect("/login");
}

var port = process.env.PORT || 3000;
app.listen(port, function () {
   console.log("Server Has Started!");
});
