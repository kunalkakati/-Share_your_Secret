//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const schema = mongoose.Schema;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://p"+process.env.HOST+"/UserDB", {useNewUrlParser: true, useUnifiedTopology: true});

const UserSchema = new schema({
    email: String,
    password: String
});

UserSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

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
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });
    user.save((err)=>{
        if(!err){
            res.render("secrets");
        }else{
            console.log(err);
        }
    });
});

app.post("/login", (req,res)=>{

    User.findOne({email: req.body.username}, (err, doc)=>{
        if(!err){
            console.log(doc.password);
            if(doc.password === req.body.password){
                res.render("secrets");
            }
            else{
            }
                res.send("You didn't register yet, please register");
        }
        else{
            console.log(err);
        }
    });
});

app.listen(3000, ()=>{
    console.log("Server start on port 3000");
});
