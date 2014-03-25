/**
 * TO DO:
 * 1. Extend the model to work with different databases for prod, stage and local
 * 2. There should be a model for users as well
*/

var mysql = require('mysql');

var sqlInfo = {
  host: 'localhost',
  user: 'root',
  password: 'viper12',
  database: 'data'
}

client = mysql.createConnection(sqlInfo);
client.connect();

var DBtables = {
    users : "users",
    resetDB : "password_reset_requests"
}

exports.client = client;
exports.DBtables = DBtables;



