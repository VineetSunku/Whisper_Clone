//jshint esversion:6
//require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require ('passport');
const  passportlocalmongoose = require ('passport-local-mongoose');

app.set('view engine', 'ejs');
app.use(session({
  secret:"Welcome to my secret",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true ,useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
userSchema.plugin(passportlocalmongoose);

const user = mongoose.model("User", userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home");
  })
 
app.get("/login",(req,res)=>{
    res.render("login");
  })

app.get("/register",(req,res)=>{
    res.render("register");
  })

app.get("/secrets",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else
  {
    res.redirect("/login");
  }
})


app.post("/register",(req,res)=>{
  
 user.register({username:req.body.username},req.body.password,(err,user)=>{
  if(err){
    console.log(err);
    res.redirect("/register");
  }else
  {
    passport.authenticate("local")(req,res,()=>{
      res.redirect("/secrets");
    })
  }
 }) 
        
})

app.post("/login",(req,res)=>{
  const uuser= new user({
    username:req.body.username,
    password:req.body.password
  });
req.login(uuser,(err)=>{
  if(err)console.log(err);
  else
  passport.authenticate("local")(req,res,()=>{
    res.redirect("/secrets");
  });
});

});


app.get("/logout",(req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})




app.listen(3000, function() {
    console.log("Server started on port 3000");
  });