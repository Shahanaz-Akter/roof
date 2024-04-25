//npm init -y for initialize the projects with package.json file. which stores metadata about your project and its dependencies.
//npm install for initialize all package.json listed dependencies package-lock.json and create node modules in your project
//npm install express //for creating basic Node.js web server,framework like Express in your project
//npm install nodemon --save-dev  //refresh every modified code

let express = require('express');
let app = express();

const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv').config();

const session = require('express-session');

app.use(session({
    secret: 'some secret',
    cookies: 'maxAge: 30000',
    resave: false,
    saveUninitialized: true,
})
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const path = require('path');
app.use(express.static('public'));
app.set('view engine', 'ejs');

const mongoose = require('mongoose');

const dbUri = require('./config/db');

// Connect to MongoDB Atlas Database
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{ 
//     console.log("Database connected"); 
//  }).catch((e)=>{ 
//     console.log(e); 
//     console.log("Database is not connected"); 
//  })

app.use('/', require('./routes/userRoute'));
app.use('/product', require('./routes/productRoute'));
app.use('/expense', require('./routes/expenseRoute'));
app.use('/cms', require('./routes/cmsRoute'));
app.use('/customer', require('./routes/customerRoute'));
app.use('/seller', require('./routes/sellerRoute'));

// app.use('/productcms', require('./routes/productCmsRoute'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    // console.log('Successfully Connected');
    console.log(`http://localhost:${port}/`);
});

// https://www.youtube.com/watch?v=HK6y8DAPN_0&pp=ygUjaW50cm9kdWNpbmcgc29yYSB0ZXh0IHZpZGVvIGVkaXRpbmc%3D




