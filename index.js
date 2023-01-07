// jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/user-model');
const Content = require('./models/content-model');
const passportLocalMongoose = require('passport-local-mongoose');
const deleteUser = require('./deleteUser');
const flash = require('connect-flash'); 


const app = express();
mongoose.set('strictQuery', false);

app.use(express.static('public'));
app.set('view engine', 'ejs'); 
app.use(flash());
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
   }).select('userType username');
 });

//GET request -- visitor access

app.get('/', (req, res) => {
   res.render('home');
}); 

app.get('/gallery', (req, res) => {
   res.render('gallery');
}); 

app.get('/login', (req, res) => {
   res.render('login');
}); 


//GET request admin only access
app.get('/accountmngr', (req, res) => {
   if (req.user.userType === 'admin') {
      User.find({}, (err, users) => {
         if (err) {
            console.log(err);
         } else {
            res.render('accountmngr', {users: users,username: req.user.username});
         }
      });
   } else {
      res.render('restricted');
   }
});

//GET request user/admin only access
app.get('/dashboard', (req, res) => {
   
   if (req.user && (req.user.userType === 'admin' || req.user.userType === 'basicuser')) {
      res.render('dashboard', {username: req.user.username});
      
   } else {
      res.render('noneuser');
   }
});

//GET request user/admin only access
app.get('/contentmngr', (req, res) => {
   if (req.user && (req.user.userType === 'admin' || req.user.userType === 'basicuser')) {
      res.render('contentmngr', {username: req.user.username, message: req.flash('success')});
   } else {
      res.render('noneuser');
   }
}); 

//GET request user/admin only access
app.get('/inventorymngr', (req, res) => {
   if (req.user && (req.user.userType === 'admin' || req.user.userType === 'basicuser')) {
      res.render('inventorymngr', {username: req.user.username});
   } else {
      res.render('noneuser');
   }
}); 

//GET request logout function
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


//POST Request for Authentication 
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


//POST Request for Account management module
app.post('/createAccount', (req, res) => {
   User.register({ username: req.body.username, userType: req.body.userType }, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        return res.render('register');
      }
      res.redirect('/dashboard');
    });
});

app.post('/changePassword', (req, res) => {
   const query = { username: req.body.username };
   
   User.findOne(query, (err, user) => {
     if (err) return res.send(500, { error: err });

     // Use passport-local-mongoose's setPassword() method to update the salted and hashed password
     user.setPassword(req.body.password, (err) => {
       if (err) return res.send(500, { error: err });

       // Save the updated user object
       user.save((err, result) => {
         if (err) return res.send(500, { error: err });

         res.redirect('/dashboard');
       });
     });
   });
 });

app.post('/deleteUser', deleteUser);

//POST Request for Content Management module

 app.post('/createContent', (req, res) => {
   const newContent = new Content({
     title: req.body.title,
     content: req.body.content,
     image: req.body.image
   });
   newContent.save((err, content) => {
     if (err) {
       console.log(err);
     } else {
      req.flash('success', 'Content was posted!'); 
      res.render('contentmngr', {username: req.user.username, message: req.flash('success')});
     }
   });
 });


app.listen(3000, () => {
     console.log('Server started at port 3000')
});