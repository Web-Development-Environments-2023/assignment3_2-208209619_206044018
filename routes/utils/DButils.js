require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query) {
    let returnValue = []
    const connection = await MySql.createConnection();
    try {
    await MySql.query(connection,"START TRANSACTION");
    returnValue = await MySql.query(connection, query);
    await MySql.query(connection, "COMMIT"); 
  } catch (err) {
    await connection.query("ROLLBACK");
    console.log('ROLLBACK at querySignUp', err);
    throw err;
  } finally {
    await MySql.release(connection);
  }
  return returnValue
}