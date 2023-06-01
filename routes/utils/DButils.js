require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query) {
    let returnValue = []
    const connection = await MySql.getConnection();
    try {
    await MySql.executeQuery(connection,"START TRANSACTION");
    returnValue = await MySql.executeQuery(connection, query);
    await MySql.executeQuery(connection, "COMMIT"); 
  } catch (err) {
    await connection.executeQuery("ROLLBACK");
    console.log('ROLLBACK at querySignUp', err);
    throw err;
  } finally {
    await MySql.releaseConnection(connection);
  }
  return returnValue
}