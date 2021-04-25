//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRoounds = 10;
const schema = mongoose.Schema;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://"+process.env.HOST+"/UserDB", {useNewUrlParser: true, useUnifiedTopology: true});

const UserSchema = new schema({
    email: String,
    password: String
});



const User = mongoose.model("userdata", UserSchema);

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

app.post("/register", (req,res)=>{

    bcrypt.hash(req.body.password, saltRoounds, (err,hash)=>{
        if(!err){
            const user = new User({
                email: req.body.username,
                password: hash
            });
            user.save((err)=>{
                if(!err){
                    res.render("secrets");
                }else{
                    console.log(err);
                }
            });
      }
    });
    
});

app.post("/login", (req,res)=>{


    
    User.findOne({email: req.body.username}, (err, doc)=>{
        if(!err){
            bcrypt.compare(req.body.password, doc.password, (err,password)=>{
                if(password === true){
                    res.render("secrets");
                }
                else{
                    res.send("You didn't register yet, please register");
                }
            });
        }
        else{
            console.log(err);
        }
    });
 
    
});

app.listen(3000, ()=>{
    console.log("Server start on port 3000");
});
