'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    obtenSucursales: obtenSucursales,
    obtenSucursal: obtenSucursal,
}

function obtenSucursales(data) {
    let query = "SELECT *, "+
                "    (select suc_empresa FROM sucursal WHERE suc_id = rel_archivo_sucursal.suc_id) as suc_empresa "+
                " FROM rel_archivo_sucursal WHERE file_id = " + data + ";";
    return helpers.executeQuery(query);
}

function obtenSucursal(data){
    let query = "SELECT * "+
                " FROM sucursal WHERE suc_id = " + data.suc_id + ";";
    return helpers.executeQuery(query);
}