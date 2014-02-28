
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

function findByUsername(username, password, done) {

    var sql="SELECT * FROM potluck WHERE email = '"+ username +"' and password = '"+ password +"' limit 1";

    client.query(sql, function (err, results) {

        var user = results[0];

        if (err) { throw err;
        }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username });
        }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' });
        }

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        return done(null, user);
    });
};


passport.use(new LocalStrategy(
    function(username, password, done) {
        return findByUsername(username, password, done);
    }
));


//gets and posts


app.get('/', function(req, res){
    res.render('index', { title: 'bookeez' });
});


app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/welcome/'+user.name);
        });
    })(req, res, next);
});

app.get('/welcome/:userId',
    function (req, res) {
        res.render ('welcome', {
            "user": req.user
            // note : going directly to "www.bookeez.com/welcome/john" will end up in ERROR because user obj is undefined
        });
    }
);

//app.get('/login', routes.login);


app.get('/login', function(req, res){
    res.render('login');
});


//NEED TO EDIT AND ADD
//app.post('/Register', function(req,res) { }

app.get('/register', function(req, res){
    res.render('register');
});


//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
