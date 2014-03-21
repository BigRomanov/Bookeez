/**
 * Forgot password module
 */

var url = require('url');
var mailer = require('nodemailer');
var ent = require('ent');


module.exports = function (opts) {
    if (typeof opts === 'string') {
        opts = { uri : opts };
    }

    var transport;
    if (opts.transportType && opts.transportOptions) {
        transport = mailer.createTransport(opts.transportType, opts.transportOptions);
    } else {
        console.log("No transport type specified!");
    }

    var reset = new Forgot(opts);

    var self = function (email, resetDB, cb) {

        var tokenID = reset.generateToken();
        var time = reset.generateTime();

        reset.insertIntoResetDB(email, resetDB, time, tokenID);

        var uri = opts.uri + '?tokenID=' + tokenID;

        transport.sendMail({
            sender  : opts.from || 'nodepasswordreset@localhost',
            to      : email,
            subject : opts.subject || 'Password Reset Request',
            text : opts.text || "",
            html :  opts.html || [
                'Click this link to reset your password:\r\n',
                '<br>',
                '<a href="' + encodeURI(uri) + '">',
                ent.encode(uri),
                '</a>',
                ''
            ].join('\r\n')
        }, function (error, success) {
            if (error) {
                if (cb.error) cb.error(error);

            } else {
                if(cb.success) cb.success(success)
            }
        });

    };
    return self;
};


function Forgot (opts) {
    this.sessions = opts.sessions || {};
    this.mount = url.parse(opts.uri);
    this.mount.port = this.mount.port || 80;
}

Forgot.prototype.generateToken = function() {
    var buf = new Buffer(16);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    var tokenID = buf.toString('base64');
    return tokenID;
};

Forgot.prototype.generateTime = function() {
    var currentdate = new Date();
    return currentdate;
};

Forgot.prototype.insertIntoResetDB = function(email, resetDB, time, tokenID) {

    var sql = "SELECT * FROM "+ resetDB +" WHERE email = '"+ email +"' limit 1";
    client.query(sql, function(err, results) {
        if (err) { throw err;
        }
        //if email already exists in resetDB we replace it for no duplications
        if (results[0]) {
            sql = "UPDATE "+ resetDB +" SET tokenID = '"+ tokenID +"' , time = '"+ time +"' WHERE email = '"+ email +"'" ;
            client.query(sql, function(err, results) {
                if (err) { throw err;
                }
            })
        }
        //if email does not exist in resetDB we insert it with tokenID and time
        else {
            sql = "INSERT INTO "+resetDB+" ( email , tokenID, time ) VALUES ('" + email + "','" + tokenID +"','" + time +"')";
            client.query(sql, function(err, results) {
                if (err) { throw err;
                }
            })
        }
    })
};

/*
module.exports.prototype = {
    checkExpired : function(tokenID, resetDB, cb) {

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
        })
    }
}

*/