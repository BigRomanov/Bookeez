
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    Auth = require('./routes/Auth'),
    user = require('./routes/user'),
    path = require('path'),
    http = require('http'),
    fs = require('fs'),
    client = require('./models');

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
        return Auth.findByUsername(passport, email, password, done);
    }
));

var forgot = require('password-reset')({
    uri: 'http://localhost:2000/password_reset',
    from: 'password-robot@localhost',
    transportType: 'SMTP',
    transportOptions: {
        service: "Gmail",
        auth: {
            user: "bookeez.app@gmail.com",
            pass: "alexandliran"
        }
    }
});

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

//gets and posts
app.get('/', routes.home);

app.get('/login', Auth.loginPage);
app.get('/register', Auth.registerPage);
app.get('/logout', Auth.logout);
app.get('/reset', Auth.resetPage);
app.get('/forgot', Auth.forgotPage);
app.get('/password_reset', Auth.resetMe);

app.post('/login', Auth.login(passport));
app.post('/Register', Auth.register);

// forgot password
app.post('/forgot', express.bodyParser(), Auth.forgot(forgot));
app.post('/reset', express.bodyParser(), Auth.reset(forgot));


//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
