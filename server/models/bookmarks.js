module.exports = function(sequelize, DataTypes) {
  var Bookmark = sequelize.define('Bookmark', {
  	// TODO: Replace with proper associations with users and sessions
  	user_id: DataTypes.INTEGER,
		title: DataTypes.STRING,
		url: DataTypes.STRING,
    faviconUrl: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Bookmark.belongsTo(models.Session)
      }
    }
  })
 
  return Bookmark
}