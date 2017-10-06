const express = require('express');
const models = require('./models');
const expressGraphQL = require('express-graphql');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const schema = require('./schema/schema');

const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config.js');
const bodyParser = require('body-parser');
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });

const passportConfig = require('./services/authService');
const ethereumService = require('./services/ethereumService');
const accountService = require('./services/accountService');

// Create a new Express application
const app = express();

// Replace with your mongoLab URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/bppoc';
//const MONGO_URI = 'mongodb://bppoc:bppoc123@ds159254.mlab.com:59254/bppoc';
if (!MONGO_URI) {
  throw new Error('You must provide a MongoLab URI');
}
// Mongoose's built in promise library is deprecated, replace it with ES2015 Promise
mongoose.Promise = global.Promise;

// Connect to the mongoDB instance and log a message
// on success or failure
mongoose.connect(MONGO_URI);
mongoose.connection
    .once('open', () => console.log('Connected to MongoLab instance.'))
    .on('error', error => console.log('Error connecting to MongoLab:', error));

// Configures express to use sessions.  This places an encrypted identifier
// on the users cookie.  When a user makes a request, this middleware examines
// the cookie and modifies the request object to indicate which user made the request
// The cookie itself only contains the id of a session; more data about the session
// is stored inside of MongoDB.
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'aaabbbccc',
  store: new MongoStore({
    url: MONGO_URI,
    autoReconnect: true
  })
}));

// Passport is wired into express as a middleware. When a request comes in,
// Passport will examine the request's session (as set by the above config) and
// assign the current user to the 'req.user' object.  See also servces/authService.js
app.use(passport.initialize());
app.use(passport.session());

// Instruct Express to pass on any request made to the '/graphql' route
// to the GraphQL instance.
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

// Webpack runs as a middleware.  If any request comes in for the root route ('/')
// Webpack will respond with the output of the webpack process: an HTML file and
// a single bundle.js output of all of our client side Javascript

app.use(webpackMiddleware(webpack(webpackConfig)));

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', requireAuth, function(req, res) {
  res.send({hi: 'there'});
});

app.get('/createAccount', function(req, res) {
  ethereumService.createAccount().then((account) => {
    console.log('returning account..');
    console.log(account);
    res.send(account);
  });
})

app.get('/getAccount/:accountAddress', function (req, res) {
  ethereumService.getAccount(req.params.accountAddress).then((account) => {
    console.log('returning account..');
    console.log(account);
    res.send(account);
  });  
});

app.post('/sendCoin', function (req, res) {
  var {
    fromAccount,
    toAccount,
    amount
  } = req.body;
  ethereumService.getAccount(fromAccount).then((account) => {
    account.sendCoin(toAccount, amount);
    res.send(account);
  });
  
});

module.exports = app;
