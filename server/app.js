
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session());

// app.use(require('sesame')()); // for password reset sessions, not sure if necessary

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
    //client.end(); //need to fix this - throws error if login failed. Is this important to end connection?
};


passport.use(new LocalStrategy(
    function(username, password, done) {
        return findByUsername(username, password, done);
    }
));

//password reset config

var forgot = require('password-reset-nodemailer')({
    uri: 'http://localhost:2000/password_reset',
    from: 'password-robot@localhost',
    transportType: 'SMTP',
    transportOptions: {
        service: "Gmail",
        auth: {
            user: "some.user@gmail.com", //change that
            pass: "passpasspass" //change this
        }
    }
});
app.use(forgot.middleware);


//gets and posts

app.get('/', function(req, res){
    res.render('index', {
        title: 'bookeez',
        user: req.user
    });
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/logout', function(req, res) {
    res.render('index', {
        "title" : 'bookeez',
        "user" : null
    })
});

app.get('/reset', function(req, res) {
    res.render('reset');
});

app.get('/forgot', function(req, res) {
    res.render('forgot');
});

app.post('/login', function(req, res, next) {
    passport.authenticate('local',
        function(err, user, info) {
            if (err) { return next(err)
            }
            if (!user) {
                return res.redirect('/login')
            }
            req.logIn(user, function(err) {
                if (err) { return next(err);
                }
                return res.redirect('/');
        });
    })(req, res, next);
});

app.post('/Register', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    //verify that the user does not already exist
    var sql = "SELECT * FROM potluck WHERE email = '"+ username +"' limit 1";
    client.query(sql, function (err, results) {
        if (err) { throw err;
        }
        if (results[0]) {
            return res.render('register', {
                message: 'user already exists'
            });
        }
        // if username does not exist, insert user to DB
        else {
            sql = "INSERT INTO potluck ( email , password ) VALUES ('" + username + "','" + password +"')";
            client.query(sql, function (err, results) {
                if (err) { throw err;
                }
                // If inserted succesfully to DB, get it and redirect to login post
                sql = "SELECT * FROM potluck WHERE email = '"+ username +"' and password = '"+ password +"' limit 1";
                client.query(sql, function (err, results) {
                    if (err) {throw err;
                    }
                    console.log('The user was inserted to DB and his name is '+username);
                })
            })
        }
    });
    // client.release(); //should we use this?

});


// forgot password

app.post('/forgot', express.bodyParser(), function(req, res) {
    var email = req.body.email;

    var callback = {
        error: function(err) {
            res.end('Error sending message: ' + err);
        },
        success: function(success) {
            res.end('Check your inbox for a password reset message.');
        }
    };
    var reset = forgot(email, callback);

    reset.on('request', function(req_, res_) {
        req_.session.reset = {
            email: email,
            id: reset.id
        };
        fs.createReadStream(__dirname + '/views/forgot').pipe(res_);
    });
});

app.post('/reset', express.bodyParser(), function(req, res) {
    if (!req.session.reset) return res.end('reset token not set');

    var password = req.body.password;
    var confirm = req.body.confirm;
    if (password !== confirm) return res.end('passwords do not match');

    // update the user db here

    forgot.expire(req.session.reset.id);
    delete req.session.reset;
    res.end('password reset');
});




//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Bookies server listening on port ' + app.get('port'));
});
