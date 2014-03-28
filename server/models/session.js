var crypto = require('crypto');

var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key       = 'password';

module.exports = function(sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
  	// TODO: Replace with proper associations with users and sessions
  	user_id: DataTypes.INTEGER,
		title: DataTypes.STRING,
    create_ts: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        Session.hasMany(models.Bookmark)
      },
      // TODO: Consider replacing with instance methods
      encryptId: function(id) {
        // TODO: Add more stuff, such as timestamp
        var text = '' + id;
        console.log(text);
        var cipher = crypto.createCipher(algorithm, key);  
        console.log(cipher);
        var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
        console.log(encrypted);
        return encrypted;
        
      }, 
      decryptId: function (encryptedId) {
        var decipher = crypto.createDecipher(algorithm, key);
        var decrypted = decipher.update(encryptedId, 'hex', 'utf8') + decipher.final('utf8');

        return decrypted;
      }
    }
  })
 
  return Session
}