var mysql = require('mysql2');
require("dotenv").config();

const dbConfig = {
  connectionLimit: 4,
  host: process.env.host,
  user: process.env.DBUSERNAME,
  password: process.env.DBPASSWORD,
  database: "lire_schema"
  
};

const dbPool = mysql.createPool(dbConfig);

const getConnection = () => {
  return new Promise((resolve, reject) => {
    dbPool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        console.log("MySQL pool connected: threadId " + connection.threadId);
        resolve(connection);
      }
    });
  });
};

const executeQuery = (connection, sql, binding) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, binding, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const releaseConnection = (connection) => {
  return new Promise((resolve, reject) => {
    console.log("MySQL pool released: threadId " + connection.threadId);
    connection.release();
    resolve();
  });
};

module.exports = { dbPool, getConnection, executeQuery, releaseConnection };
