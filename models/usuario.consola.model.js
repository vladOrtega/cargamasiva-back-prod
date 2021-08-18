'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    verificaExistUsr: verificaExistUsr,
    ObtenerUsuarioId: ObtenerUsuarioId,
    getUsuarioByUserName: getUsuarioByUserName,
    //getOnlyUsuarioByUserName: getOnlyUsuarioByUserName,
    obtenerUsuarios: obtenerUsuarios,
    GetMaxUsuarioSistema: GetMaxUsuarioSistema,
    GetUsuarioSistemaById: GetUsuarioSistemaById,
    Update: Update,
    Add: Add,
    //addUser: addUser, 
    obtenerPerfilesConsola: obtenerPerfilesConsola
}

function verificaExistUsr(data) {
    let query = "SELECT * FROM usuario_sistema WHERE  username =" + data.username + "  iUsrName and usu_status = 1;";
    return helpers.executeQuery(query);
}

function ObtenerUsuarioId(data) {
    let query = "SELECT * FROM usuario_sistema WHERE  id_usuario_sistema =" + data.username + " and usu_status = 1;";
    return helpers.executeQuery(query);
}

function getUsuarioByUserName(data) {
    let query = "select * from usuario_sistema where username = '" + data.username + "' and usu_status = 1";
    return helpers.executeQuery(query);
}

function obtenerUsuarios() {
    let query = "select * from usuario_sistema where  usu_status = 1";
    return helpers.executeQuery(query);
}

function obtenerUsuario(idUsuario) {
    let query = "select * from usuario_sistema where  usu_status = 1 and id_usuario_sistema ="+ idUsuario.id_usuario_sistema;
    return helpers.executeQuery(query);
}

function GetMaxUsuarioSistema() {
    let query = "select top 1 * from usuario_sistema ORDER BY 1 DESC";
    return helpers.executeQuery(query);
}

function GetUsuarioSistemaById(data) {
    let query = "SELECT * FROM usuario_sistema where id_usuario_sistema =" + data.id_usuario_sistema;
    return helpers.executeQuery(query);
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

    return helpers.executeQuery(query);
}

function Add(data) {
    let query = "insert into usuario_sistema " +
        " ( username, name, nip,id_perfil, usu_status, register_date ) " +
        " VALUES ( '" + data.username + "', '" + data.name + "','" + data.nip + "', " + data.id_perfil + ", 1, getdate() )";
    return helpers.executeQuery(query);
}


function obtenerPerfilesConsola() {
    let query = "SELECT * from  perfil where status_perfil = 1 order by descripcion asc;";
    return helpers.executeQuery(query);
}