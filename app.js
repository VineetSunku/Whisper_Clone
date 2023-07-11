//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require ('passport');
const  passportlocalmongoose = require ('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate= require("mongoose-findorcreate");


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
  password:String,
  googleId:String,
  secret:String  
});
userSchema.plugin(passportlocalmongoose);
userSchema.plugin(findOrCreate);

const user = mongoose.model("User", userSchema);

passport.use(user.createStrategy());

passport.serializeUser(function(user, done) {
 done(null,user.id)
});

passport.deserializeUser(function(id, done) {
  var errr,id;
  user.findById(id)
  .then(function (models) {
    id=models;
  })
  .catch(function (err) {
   errr=err;
  });
  done(errr,id);
  
 
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  user.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/",(req,res)=>{
    res.render("home");
  })

  app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
 
app.get("/login",(req,res)=>{
    res.render("login");
  })

app.get("/register",(req,res)=>{
    res.render("register");
  })

app.get("/secrets",(req,res)=>{
  user.find({"secret":{$ne:null}})
  .then(function (foundusers) {
    
    res.render("secrets",{userWithSecrets: foundusers});
  })
  .catch(function (err) {
   console.log(err);
  });

})

app.get("/submit",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
  }
  else
  {
    res.redirect("/login");
  }
})

app.post("/submit",(req,res)=>{
  console.log(req.user);
  const secr=req.body.secret;
  user.findById(req.user.id)
  .then(function (founduser) {
    founduser.secret=secr;
    founduser.save();
    res.redirect("/secrets");
  })
  .catch(function (err) {
   console.log(err);
  });

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