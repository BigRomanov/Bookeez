
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var login = require('./routes/login');
var http = require('http');
var path = require('path');
var fs = require('fs');

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

app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// app.use(require('sesame')()); // for password reset sessions, not sure if necessary

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
    //client.end(); //need to fix this - throws error if login failed. Is this important to end connection?
};


passport.use(new LocalStrategy(
    function(username, password, done) {
        return findByUsername(username, password, done);
    }
));

//password reset config
var forgot = require('password-reset')({
    uri: 'http://localhost:2000/password_reset',
    from: 'password-robot@localhost',
    transportType: 'SMTP',
    transportOptions: {
        service: "Gmail",
        auth: {
            user: "bookeez.app@gmail.com", //change that
            pass: "alexandliran" //change this
        }
    }
});


//gets and posts
app.get('/', routes.home);
app.get('/login', routes.loginPage);
app.get('/register', routes.registerPage);
app.get('/logout', routes.logout);
app.get('/reset', routes.resetPage);
app.get('/forgot', routes.forgotPage);
//app.get('/password_reset:?tokenID', routes.resetMe);
app.get('/password_reset', routes.resetMe);


app.post('/login', routes.login(passport));
app.post('/Register', routes.register);

// forgot password
app.post('/forgot', express.bodyParser(), routes.forgot(forgot));
app.post('/reset', express.bodyParser(), routes.reset(forgot));

//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
