/**
 * TO DO:
 * 1. Extend the model to work with different databases for prod, stage and local
 * 2. There should be a model for users as well
*/

var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , sequelize = new Sequelize('data', 'root', 'viper12') // move this 
  , db        = {}
 
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })
 
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    console.log("Associating ", modelName);
    db[modelName].associate(db)
  }
})
 
module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db)



