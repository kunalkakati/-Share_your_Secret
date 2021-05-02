//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//PassportJs
const passport = require("passport");
const session = require("express-session");
const PassportLocalMongoose =  require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: "HelloMyNameIsKunal",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());  

mongoose.connect("mongodb://"+process.env.HOST+"/UserDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

UserSchema.plugin(PassportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = mongoose.model("userdata", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
        console.log(profile);
      return cb(err, user);
    });
  }
));

app.get("/", (req,res)=>{
    res.render("home");
});

app.get("/auth/google", passport.authenticate("google", {scope: ["profile"]})
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", (req,res)=>{
    res.render("login");
});
app.get("/register", (req,res)=>{
    res.render("register");
});

app.get("/submit", (req,res)=>{
    res.render("submit");
});

app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/");
})

app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.post("/register", (req,res)=>{

    User.register({username: req.body.username}, req.body.password, function(err, username){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
             passport.authenticate("local")(req,res, function(){
                if(err){
                    console.log(err);
                    res.redirect("/register");
                }
                else{
                        res.redirect("/secrets");
                }
            });
        }
    });

});

app.post("/login", (req,res)=>{

   const user = new User({
       username: req.body.username,
       password: req.body.password
   });
    
   req.logIn(user, (err)=>{
       if(err){
           console.log(err);
       }else{
           passport.authenticate("local")(req,res, function(err){
               res.render("secrets");
           });
       }
   });

});

app.listen(3000, ()=>{
    console.log("Server start on port 3000");
});
