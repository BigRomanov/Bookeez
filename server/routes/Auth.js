/**
 * This is the route for all controllers involved with user login, register, and forgot password requests
 *
 * TO DO :
 * 1. fix bug in generating the tokenID, once there are signed such as +
 * 2. fix bug on reset page once the user is not found, server crashes
 * 3. handle all responses and handle all errors without just throwing them
 */

var passwordHash = require('password-hash');

var client = require('.././models').client,
    DBtables = require('.././models').DBtables,
    usersDB = DBtables.users,
    resetDB = DBtables.resetDB;

//email validation. returns boolean
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//password verification.
function validatePassword(password) {
    return (password != "" && password.toString().length >= 8)
}



exports.findByUsername = function(passport, email, password, done) {

    var sql="SELECT * FROM "+ usersDB +" WHERE email = '"+ email +"' limit 1";
    client.query(sql, function (err, results) {
        var user = results[0];
        if (err) { throw err;
        }
        if (!user) { return done(null, false, { message: 'Unknown user ' + email });
        }
        if (!passwordHash.verify(password, user.password)) { return done(null, false, { message: 'Invalid password' })
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

exports.loginPage =  function(req, res){
    res.render('login');
};

exports.registerPage =  function(req, res){
    res.render('register');
};

exports.logout =  function(req, res) {
    res.render('index', {
        "title" : 'bookeez',
        "user" : null
    })
};

exports.resetPage = function(req, res) {
    res.render('reset');
};

exports.forgotPage = function(req, res) {
    res.render('forgot');
};

exports.resetMe =  function(req, res) {
    var currentToken = req.param('tokenID');
    res.render('forgot', {
        tokenID : currentToken
    })
};

exports.login = function(passport) {
    return function(req, res, next) {
        passport.authenticate('local',
            function(err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.redirect('/login');
                }
                req.logIn(user, function(err) {
                    if (err) { return next(err);
                    }
                    return res.redirect('/');
                });
            })(req, res, next);
    }
};

exports.register = function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    //verify that the user does not already exist
    var sql = "SELECT * FROM "+ usersDB +" WHERE email = '"+ email +"' limit 1";
    client.query(sql, function (err, results) {
        if (err) { throw err;
        }
        if (results[0]) {
            return res.render('register', {
                message: 'user already exists'
            });
        }
        // if email does not exist, insert user to DB
        else {
            if (validateEmail(email)) {
                if (validatePassword(password)) {
                    var hashedPassword = passwordHash.generate(password);
                    sql = "INSERT INTO "+ usersDB +" ( email , password ) VALUES ('" + email + "','" + hashedPassword +"')";
                    client.query(sql, function (err, results) {
                        if (err) { throw err;
                        }
                        // If inserted succesfully to DB, get it and redirect to login post
                        sql = "SELECT * FROM "+ usersDB +" WHERE email = '"+ email +"' and password = '"+ hashedPassword +"' limit 1";
                        client.query(sql, function (err, results) {
                            if (err) {throw err;
                            }
                            console.log('The user was inserted to DB and his name is '+email);
                            res.render('index', {
                                title: 'Bookeez',
                                user: results[0]
                            });
                            // IMPORTANT!! NEED TO ADD VERIFICATION VIA EMAIL FOR EVERY REGISTERED USER!
                        })
                    })
                }
                else {
                    res.render('register', {
                        message: "Invalid password. Please make sure your password contains at least 8 characters"
                    });
                }
            }
            else {
                res.render('register', {
                    message: "Invalid email address. Please verify that the email address is correct"
                });
            }

        }
    });
    // client.release(); //should we use this?

};

exports.reset = function (forgot) {
    return function(req, res) {

        var tokenID = req.body.tokenID;
        var password = req.body.password;
        var confirm = req.body.confirm;
        var hashedPassword = passwordHash.generate(password);

        if (!validatePassword(password)) {
            res.render('reset' , {
                message: "Invalid password. Please make sure your password contains at least 8 characters"
            });
        }
        if (password !== confirm) {
            res.render('reset' , {
                message: 'passwords do not match, please try again'
                // implement this in page, detecting passwords do not match
            });
        }

        var callback = {
            expired: function() {
                res.end('The token is expired, try again please.');
            },
            success: function() {
                var email = this.email;
                //UPDATE DB HERE
                var sql = "UPDATE `"+ usersDB +"` SET `password` = '" + hashedPassword + "' WHERE `"+ usersDB +"`.`email` ='" + email + "'";
                client.query(sql, function (err, results) {
                    if (err) { throw err;
                    }
                    sql = "DELETE from " + resetDB + " WHERE email='" + email + "'";
                    client.query(sql, function (err, results) {
                        if (err) { throw err;
                        }
                    });
                });
                res.end('password reset');
            }
        };

        //forgot.checkExpired(tokenID, resetDB, callback);

        var checkExpired = function(tokenID, resetDB, cb) {

            var current_time = new Date();
            var user = null;
            var sql = "SELECT * FROM "+ resetDB +" WHERE tokenID = '"+ tokenID +"' limit 1";
            client.query(sql, function(err, results) {
                if (err) { throw err;
                }
                if (!results[0]) {
                    res.end('token is missing');
                    console.log('no user found');
                }
                //found the user, get the request time and compare
                var user = results[0];

                current_time = current_time.getTime();
                var request_time = new Date(user.time);
                request_time = request_time.getTime();
                var diff = (current_time - request_time)/60000 ;
                console.log('the diff is '+ diff);
                if (diff > 10) {
                    //if more than 10 minutes, callback gets expired value
                    if (cb.expired) cb.expired();
                } else {
                    //otherwise, callback gets good to go with the user email
                    if (cb.success) {
                        cb.email = user.email;
                        cb.success();
                    }
                }
            });
        };

        checkExpired(tokenID, resetDB, callback);

    }
};

exports.forgot =  function(forgot) {
    return function(req, res) {

        var email = req.body.email;

        var callback = {
            error: function(err) {
                res.end('Error sending message: ' + err);
            },
            success: function(success) {
                res.end('Check your inbox for a password reset message.');
            }
        };

        var sql = "SELECT * FROM "+ usersDB +" WHERE email = '"+ email +"' limit 1";
        client.query(sql, function(err, results) {
            if (err) { throw err;
            }
            if (!results[0]) {
                res.render('reset', {
                    message : 'Please make sure the email address is correct.'
                })
            } else {
                forgot(email, resetDB, callback);
            }
        });
    };
};



