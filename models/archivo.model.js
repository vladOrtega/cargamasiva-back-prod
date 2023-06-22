'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    obtenSucursales: obtenSucursales,
    obtenSucursal: obtenSucursal,
    insertTokenDB: insertTokenDB
}

function obtenSucursales(data) {
    let query = "SELECT s.* FROM sucursal s, rel_archivo_sucursal ras WHERE s.suc_id = ras.suc_id and ras.file_id = " + data + ";";
    return helpers.executeQuery(query);
}

function obtenSucursal(data){
    let query = "SELECT * "+
                " FROM sucursal WHERE suc_id = " + data.suc_id + ";";
    return helpers.executeQuery(query);
}

function insertTokenDB(token,sucID) {
    let query = "UPDATE Sucursal  SET suc_tokenSB = '"+token+"' WHERE suc_id=" + sucID + ";";
    return helpers.executeQuery(query);
}