
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//var mongoose = require('mongoose'); //comment it
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//DB
var mysql = require('mysql');

var sqlInfo = {
    host: 'localhost',
    user: 'root',
    password: 'viper12',
    database: 'data'
}

client = mysql.createConnection(sqlInfo);

//app
var app = express();

// all environments
app.set('port', process.env.PORT || 2000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router); //make sure that i do not need to move this line
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());


app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// mongoose
//mongoose.connect('mongodb://localhost/passport_local_mongoose'); //comment it later


app.get('/', function(req, res){
    res.render('index', { title: 'bookeez' });
});

app.get('/login', function(req, res){
    res.render('login', {user : req.user });
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/login', function(req,res) {
    client.connect();
    var user_email = req.body.email,
        user_password = req.body.password,
        temp_query = "SELECT * FROM potluck WHERE email = '"+ user_email +"' and password = '"+ user_password +"' limit 1";

    client.query(temp_query , function(err, results) {

        if (err) throw err;

        if (results[0]) {

            passport.serializeUser(function(results, done) {
                done(null,results);
            });

            passport.deserializeUser(function(id, done) {
                done(null,results);

            });

            var name=rows[0].name,
                pass=rows[0].password,
                email=rows[0].email;

            res.render('test', {
                name : name,
                password : pass,
                email : email
            })
        }
        else {
            res.redirect('/');
        }
    });
    client.end();
});

//app.post('/register', routes.register(client));


// routes
//require('./routes')(app);




app.get('/test',function(req,res) {
  client.connect();
  client.query('SELECT * from potluck', function(err, rows, fields) {
  if (err) throw err;
    name=rows[0].name;
    pass=rows[0].password;
    email=rows[0].email;

    res.render('test', {
      name : name,
      password : pass,
      email : email
    });
  });
  client.end();
});




/*
//brought from routes and modified for sql:
// ! next stage is to move all the handlers, or even all this next code to routes/index.js


//var passport = require('passport');
//var Account = require('./models/account');

app.get('/', function (req, res) {
    res.render('index', {
        user : req.user,
        title : 'Bookies'
    });
});

app.get('/register', function(req, res) {
    res.render('register', { });
});

app.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

app.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/ping', function(req, res){
    res.send("pong!", 200);
});

*/


http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
