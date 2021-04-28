//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passport = require("passport");
const session = require("express-session");
const PassportLocalMongoose =  require("passport-local-mongoose");

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

const UserSchema = new schema({
    email: String,
    password: String
});

UserSchema.plugin(PassportLocalMongoose);

const User = mongoose.model("userdata", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req,res)=>{
    res.render("home");
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
                    console.log("this");
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
