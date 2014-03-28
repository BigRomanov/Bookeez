module.exports = function(sequelize, DataTypes) {
  var Bookmark = sequelize.define('Bookmark', {
  	// TODO: Replace with proper associations with users and sessions
  	user_id: DataTypes.INTEGER,
		session_id: DataTypes.INTEGER,
		title: DataTypes.STRING,
		url: DataTypes.STRING
  }, {
    classMethods: {
      // associate: function(models) {
      //   Task.belongsTo(models.User)
      // }
    }
  })
 
  return Bookmark
}