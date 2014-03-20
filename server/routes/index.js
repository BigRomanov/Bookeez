// var mailer = require('nodemailer');

exports.home =  function(req, res){
    res.render('index', {
        title: 'bookeez',
        user: req.user
    });
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
    console.log('the token is ' + currentToken);
    res.render('forgot', {
        tokenID : currentToken
    })
};


exports.login = function(passport) {
    return function(req, res, next) {
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
    }
};

exports.register = function(req, res, next) {
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
                    res.render('index', {
                        user: results[0]
                    });
                    // IMPORTANT!! NEED TO ADD VERIFICATION VIA EMAIL FOR EVERY REGISTERED USER!
                })
            })
        }
    });
    // client.release(); //should we use this?

};

exports.reset = function (forgot) {
    return function(req, res) {

        var resetDB = 'password_reset_requests';
        var tokenID = req.body.tokenID;
        var password = req.body.password;
        var confirm = req.body.confirm;
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
                var sql = "UPDATE `potluck` SET `password` = '" + password + "' WHERE `potluck`.`email` ='" + email + "'";
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


        //START FROM HERE

        var checkExpired = function(tokenID, resetDB, cb) {

            var current_time = new Date();
            var user = null;
            var sql = "SELECT * FROM "+ resetDB +" WHERE tokenID = '"+ tokenID +"' limit 1";
            client.query(sql, function(err, results) {
                if (err) { throw err;
                }
                if (!results[0]) {
                    //res.end('token is missing');
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

        var resetDB = 'password_reset_requests';
        var email = req.body.email;

        var callback = {
            error: function(err) {
                res.end('Error sending message: ' + err);
            },
            success: function(success) {
                res.end('Check your inbox for a password reset message.');
            }
        };

        var sql = "SELECT * FROM potluck WHERE email = '"+ email +"' limit 1";
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



