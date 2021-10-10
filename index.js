if (process.env.ENV === 'dev') require('dotenv').config();

const express = require('express');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const passport = require('passport');

const app = express();

app.use(flash());

const initializePassport = require('./utils/passport-helper');

const {getMongoConnectionString} = require('./utils/db');

// Import models
const { User } = require('./models');

app.use(express.urlencoded({extended: true}));

const mongoUri = getMongoConnectionString(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD, process.env.MONGODB_HOST, process.env.MONGODB_PORT);
const connection = mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
/* Display message in the console if the connection is successful. */
mongoose.connection.once('open', () => {
    console.log('connected!')
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false
    }
}));

const env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('view engine', 'html');

app.use((req, res, next) => {
    // Add user details to global variables accessible by nunjucks
    env.addGlobal('user', req.user);
    next();
});

initializePassport(app, passport);

app.get('/', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    const users = await User.find({});
    res.render('home.html', { users });
});

// Import routes
app.use('/', require('./routes/register'));
app.use('/', require('./routes/auth')(passport));
app.use('/', require('./routes/password-reset'));

const PORT = '8000';
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});