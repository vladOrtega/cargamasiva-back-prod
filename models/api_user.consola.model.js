'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    obtenApiUsers: obtenApiUsers,
    agregaApiUser: agregaApiUser,
    actualizarApiUser: actualizarApiUser,
    validateUserKey: validateUserKey
}

function obtenApiUsers() {
    return helpers.mysqlQuery('GET', conn_mysql, "SELECT * FROM api_user where api_user_status = 1");
}

function agregaApiUser(data) {
    return helpers.mysqlQuery('GET', conn_mysql, "CALL setApiUserCatalogo ('" + data.api_user_name + "', " + data.api_user_key + ")");
}

function actualizarApiUser(data) {
    let query =
        "update api_user set " +
        " api_user_name = '" + data.api_user_name + "'" +
        ", api_user_key = '" + data.api_user_key + "'" +
        ", api_user_status =" + data.api_user_status +
        " where api_user_id =" + data.api_user_id;
    return helpers.mysqlQuery('GET', conn_mysql, query);
}

function validateUserKey(key){
    return helpers.mysqlQuery('GET', conn_mysql, "SELECT * FROM api_user where api_user_status = 1 and api_user_key = '"+key+"';");

}