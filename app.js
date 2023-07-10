//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require('mongoose');
app.set('view engine', 'ejs');
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true ,useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const encrypt = require('mongoose-encryption');
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

const user = mongoose.model("User", userSchema);



app.get("/",(req,res)=>{
    res.render("home");
  })
 
app.get("/login",(req,res)=>{
    res.render("login");
  })

app.get("/register",(req,res)=>{
    res.render("register");
  })
app.post("/register",(req,res)=>{
  const newu = new user({
    email:req.body.username,
    password:req.body.password
  })
  newu.save()
  .then(()=>{
    res.render("secrets");
  })
  .catch((err)=>{
    console.log(err);
   });
        
})

app.post("/login",(req,res)=>{
  const username=req.body.username;
  const password=req.body.password;
  user.findOne({email:username})
  .then((opt)=>{
    if(opt)
    {
      if(opt.password===password)res.render("secrets");
    }
  })
  .catch((err)=>{
    console.log(err);
   });

})



app.listen(3000, function() {
    console.log("Server started on port 3000");
  });