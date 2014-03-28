module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished

		migration.createTable('sessions',
		  {
		    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		    createdAt: { type: DataTypes.DATE },
		    updatedAt: { type: DataTypes.DATE },
		    user_id:   { type:DataTypes.INTEGER } ,
		    title: DataTypes.STRING,
		  },
		  {
		    engine: 'MYISAM', // default: 'InnoDB'
		  }
		)

    done()
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('sessions')
    done()
  }
}
