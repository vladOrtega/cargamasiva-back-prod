'use strinct'
var sql = require("mssql");
var fs = require('fs');

module.exports = {
  executeQuery: executeQuery
}

var cred_sqlserver = JSON.parse(fs.readFileSync(__dirname + '/cred_sqlserver', 'utf8'));

function executeQuery(query) {
  console.log("query: " + query);
  return new Promise(function (resolve, reject) {
    sql.connect(cred_sqlserver, function (err) {
      if (err)
        console.log(err);
      // create Request object
      let sqlRequest = new sql.Request();
      // query to the database and get the records
      sqlRequest.query(query, function (err, data) {
        if (err) {
          console.log(err)
          resolve({
            err: true
          });
        } else { 
          let resData = data.recordset;
          let resMultiple = data.recordsets;
          sql.close();
          resolve({
            err: false,
            result: resData,
            results: resMultiple
          });
        }
      });
    });
  })
}