
/*
 * NEED TO FIX AND INTEGRATE THIS PAGE. RIGHT NOT ITS ALL IN APP.JS
 */


exports.index = function(req, res){
    res.render('index', { title: 'bookeez' });
}

exports.loginPage = function(req, res){
    res.render('login');
}

exports.registerPage = function(req, res){
    res.render('register');
}

exports.login = function(client) {
    return function(req,res) {
        client.connect();
        var user_email = req.body.email;
        var user_password = req.body.password;
        client.query('SELECT * from potluck WHERE email = '+user_email , function(err, rows, fields) {
            if (err) throw err;
            if (rows[0]) {

                var name=rows[0].name,
                    pass=rows[0].password,
                    email=rows[0].email;

                res.render('test', {
                    name : name,
                    password : pass,
                    email : email
                })
                res.redirect('test');
            }
        });
        client.end();
    }
}

/*
 exports.register = function(client) {
 return function(req,res) {
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
 }
 }
 */


/*
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

exports.exerciseslist = function(db) {
    return function(req, res) {
        var collection = db.get('exercisescollection');
        collection.find({},{},function(e,docs){
            res.render('exerciseslist', {
                "exerciseslist" : docs,
                title : 'LOGEEK academy'
            });
        });
    };
};

*/