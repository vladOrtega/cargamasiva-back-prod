'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    verificaExistUsr: verificaExistUsr,
    ObtenerUsuarioId: ObtenerUsuarioId,
    getUsuarioByUserName: getUsuarioByUserName,
    getOnlyUsuarioByUserName: getOnlyUsuarioByUserName,
    obtenerUsuarios: obtenerUsuarios,
    GetMaxUsuarioSistema: GetMaxUsuarioSistema,
    GetUsuarioSistemaById: GetUsuarioSistemaById,
    Update: Update,
    Add: Add,
    addUser: addUser, 
    obtenerPerfilesConsola: obtenerPerfilesConsola
}


function verificaExistUsr(data) {
    let query = "SELECT * FROM usuario_sistema WHERE  username =" + data.username + "  iUsrName and usu_status = 1;";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function ObtenerUsuarioId(data) {
    let query = "SELECT * FROM usuario_sistema WHERE  id_usuario_sistema =" + data.username + " and usu_status = 1;";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function getOnlyUsuarioByUserName(data){
    let query = "select * from usuario where usu_email = '" + data.username + "' and usu_status = 1";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function getUsuarioByUserName(data) {
    let query = "select * from usuario_sistema where username = '" + data.username + "' and usu_status = 1";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}
 
function obtenerUsuarios() {
    let data = '';
    let query = "select * from usuario_sistema where  usu_status = 1";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function GetMaxUsuarioSistema() {
    let data = '';
    let query = "select * from usuario_sistema LIMIT 1 ORDER BY 1 DESC";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function GetUsuarioSistemaById(data) {
    let query = "SELECT * FROM usuario_sistema where id_usuario_sistema =" + data.id_usuario_sistema;
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}

function Update(data) {
    let query = "";
    if(data.nip){
        query = "update usuario_sistema " +
            " set username = '" + data.username + "', nip = '"+data.nip+"', name = '" + data.name + "', id_perfil = " + data.id_perfil + ", usu_status = " + data.usu_status +
            " where id_usuario_sistema =" + data.id_usuario_sistema;
    } else {
        query = "update usuario_sistema " +
            " set username = '" + data.username + "', name = '" + data.name + "', id_perfil = " + data.id_perfil + ", usu_status = " + data.usu_status +
            " where id_usuario_sistema =" + data.id_usuario_sistema;
    }

    return helpers.mysqlQuery('PUT', conn_mysql, query, data)
}

function Add(data) {
    
    let query = "insert into usuario_sistema " +
        " ( username, name, nip,id_perfil, usu_status, register_date ) " +
        " VALUES ( '" + data.username + "', '" + data.name + "','" + data.nip + "', " + data.id_perfil + ", 1, now() )";
    console.log(query, data);
    return helpers.mysqlQuery('PUT', conn_mysql, query, data)
}

function addUser(data) {
    let query = "call addUser('" + data.username + "', '" + data.nip + "','" + data.name + "', " + data.id_perfil + ", "+ data.usu_edit +")";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}


function obtenerPerfilesConsola() {
    let query = "SELECT * from  perfil where status_perfil = 1 order by descripcion asc;";
    return helpers.mysqlQuery('GET', conn_mysql, query, data)
}