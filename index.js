// jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/user-model');
const passportLocalMongoose = require('passport-local-mongoose');
const deleteUser = require('./deleteUser');



const app = express();
mongoose.set('strictQuery', false);

app.use(express.static('public'));
app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({extended: true})); 

app.use(session({
   secret: 'This is a top secret', // change session secret
   resave: false,
   saveUninitialized: false
 }));

 app.use(passport.initialize());
 app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDBase', {useNewUrlParser: true});


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) { // modify serializeUser() method
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
   User.findById(id, function(err, user) {
     done(err, user);
   }).select('userType');
 });

//GET request 

app.get('/', (req, res) => {
   res.render('home');
}); 

app.get('/gallery', (req, res) => {
   res.render('gallery');
}); 

app.get('/login', (req, res) => {
   res.render('login');
}); 

app.get('/dashboard', (req, res) => {
   res.render('dashboard');
}); 


app.get('/accountmngr', (req, res) => {
   if (req.user.userType === 'admin') {
      User.find({}, (err, users) => {
         if (err) {
            console.log(err);
         } else {
            res.render('accountmngr', {users: users});
         }
      });
   } else {
      res.render('restricted');
   }
});

app.get('/contentmngr', (req, res) => {
   res.render('contentmngr');
}); 

app.get('/inventorymngr', (req, res) => {
   res.render('inventorymngr');
}); 

app.get('/logout', (req, res) => {
   req.logout(err => {
      if (err) {
         console.log(err);
      } else {
         res.redirect('/');
      }
   });
}); 


//POST Request 


app.post('/createAccount', (req, res) => {
   User.register({ username: req.body.username, userType: req.body.userType }, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        return res.render('register');
      }
      res.redirect('/dashboard');
    });
});

app.post('/login', (req, res) => {
   const user = new User({
      username: req.body.username,
      password: req.body.password
   });

   req.login(user, (err) => {
      if (err) {
         console.log(err);
      } else {
         passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login'
         })(req, res);
      }
   });
}); 

app.post('/deleteUser', deleteUser);

app.listen(3000, () => {
     console.log('Server started at port 3000')
});