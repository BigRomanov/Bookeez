

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
        var reset = forgot(email, callback);

        reset.on('request', function(req_, res_) {
            req_.session.reset = {
                email: email,
                id: reset.id
            };
            //fs.createReadStream(__dirname + '/views/forgot.jade').pipe(res_); //the code doesn't really use this!
            res_.render('forgot', {
                email: email
            });
        });
    }
};

exports.reset = function (forgot) {
    return function(req, res) {
        if (!req.session.reset) return res.end('reset token not set');

        var email = req.body.email;
        console.log('email is :' +email);
        var password = req.body.password;
        var confirm = req.body.confirm;
        if (password !== confirm) return res.end('passwords do not match');

        // update the user db here
        var sql = "UPDATE `potluck` SET `password` = '" + password + "' WHERE `potluck`.`email` ='" + email + "'";
        client.query(sql, function (err, results) {
            if (err) { throw err;
            }
        })

        forgot.expire(req.session.reset.id);
        delete req.session.reset;
        res.end('password reset');
    }
};