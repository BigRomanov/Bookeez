module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished

		migration.createTable('bookmarks',
		  {
		    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		    createdAt: { type: DataTypes.DATE },
		    updatedAt: { type: DataTypes.DATE },
		    user_id: DataTypes.INTEGER,
		    session_id: DataTypes.INTEGER,
		    title: DataTypes.STRING,
		    url: DataTypes.STRING
		  },
		  {
		    engine: 'MYISAM', // default: 'InnoDB'
		  }
		)

    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('bookmarks')
    done()
  }
}
