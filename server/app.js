
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// passport config for mysql

function check_auth_user(username, password, done){
    var sql="SELECT * FROM potluck WHERE email = '"+ username +"' and password = '"+ password +"' limit 1";
    client.query(sql, function (err, results) {
        if (err) {
            return done(err);
        }
        else if (results[0]) {
            return done(err, results[0])
            console.log("I found the user!");
        }
        else {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
    });
    //client.end();
}

passport.use(new LocalStrategy(check_auth_user));

passport.serializeUser(function(res, done) {
    done(null, res.id);
});

passport.deserializeUser(function(user, done) {
    var sql="SELECT * FROM `potluck` WHERE email = '"+ user +"' limit 1";
    client.query(sql, function (err, results) {
        if (err) {
            return done(err);
            console.log("ERRRRRRRRRRRRRRRRRRRRR")
        }
        else if (results[0]) {
            return done(err, results[0])
        }
    });
    //client.end();
});


// mongoose
//mongoose.connect('mongodb://localhost/passport_local_mongoose'); //comment it later


app.get('/', function(req, res){
    res.render('index', { title: 'bookeez' });
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/test',
    successRedirect: '/'
}));

app.get('/login', function(req, res){
    res.render('login');
});

//app.post('/Register', function(req,res) { }   NEED TO EDIT AND ADD
app.get('/register', function(req, res){
    res.render('register');
});


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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
