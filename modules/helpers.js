var mysql = require('mysql');
conn_mysql = null;
var fs = require('fs');
var mysql_cred = JSON.parse(fs.readFileSync(__dirname + '/cred_mysql', 'utf8'));

conn_mysql = mysql.createConnection(mysql_cred);

//probando
conn_mysql.connect(function (error) {
  if (!!error) console.log(error);
  else console.log('mYSQL Database Connected!');
});

conn_mysql.config.queryFormat = function (query, values) {
  if (!values) return query
  return query.replace(/\@(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key])
    }
    return txt
  }.bind(this))
}

module.exports.mysqlQuery = function (tipo, c, query, d) {
  return new Promise(function (resolve, reject) {
    conn_mysql.query(query, d, function (err, rs) {
      console.log("query", query)
      if (err) {
        console.log("error", err);
        resolve({
          err: true,
          description: err
        });
        //process.exit(1);
      } else {
        if (tipo == 'GET') {
          resolve({
            err: false,
            result: rs
          });
        } else {
          resolve({
            err: false
          });
        }
      }
    });
  });
}