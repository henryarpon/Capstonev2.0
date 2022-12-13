//jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({extended: true})); 

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


app.listen(3000, () => {
     console.log('Server started at port 3000')
});