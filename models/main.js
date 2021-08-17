Promise = require('bluebird');


module.exports.start = function () {
  return new Promise(function (resolve, reject) {
    resolve({
      conn: "conn_sqla",
      sql: "sql"
    });
  });
}