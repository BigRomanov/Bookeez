/**
 * Forgot password module
 */

var url = require('url'),
    mailer = require('nodemailer'),
    ent = require('ent'),
    crypto = require('crypto');


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

        reset.generateToken(48, function(tokenID) {

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
        })

    };
    return self;
};


function Forgot (opts) {
    this.sessions = opts.sessions || {};
    this.mount = url.parse(opts.uri);
    this.mount.port = this.mount.port || 80;
}

Forgot.prototype.generateToken = function(tokenSize, cb) {

    crypto.randomBytes(tokenSize, function(ex, buf) {
        if (ex) {
            throw (ex);
        }
        else {
            var token = buf.toString('hex');
            cb(token);
        }
    });
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
