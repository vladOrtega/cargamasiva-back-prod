'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    executeStored: executeStored,
    validateMetodo: validateMetodo,
    getParamsMetodo: getParamsMetodo,
    getParamsMetodoType: getParamsMetodoType
}


function validateMetodo(metodo, tipo) {
    return {
        err: false,
        result: global.Metodos.filter(x => x.apimetod_nombre === metodo && x.apimetod_type === tipo)
    }
    //return helpers.mysqlQuery('GET', conn_mysql, "SELECT * FROM api_metodo WHERE apimetod_status = 1 and apimetod_nombre = '" + metodo + "' and apimetod_type= '" + tipo + "';", '')
}

function getParamsMetodo(metodo) {
    return {
        err: false,
        result: global.Metodos.find(x => x.apimetod_id === metodo.apimetod_id).parametros
    }
    //return helpers.mysqlQuery('GET', conn_mysql, "SELECT amc.*, cc.col_nombre, cc.tbl_id FROM api_metodo_campo amc, cat_columna cc WHERE amc.col_id = cc.col_id and amc.apimetodcamp_status = 1 and apimetod_id = '" + metodo.apimetod_id + "';", '');
}

function executeStored(query) {
    return helpers.mysqlQuery('GET', conn_mysql, "CALL " + query, '')
}

function getParamsMetodoType(columnas, tipo, idmetodo){
    let metodo = global.Metodos.find(x => x.apimetod_id === idmetodo) 
    return {
        err: false,
        result: metodo.parametros.filter(y => y.apimetodcamp_key === tipo && columnas.indexOf(","+y.col_nombre+",") !== -1)
    }
    //console.log(temp);
    //return helpers.executeQuery("SELECT distinct cc.col_nombre FROM api_metodo_campo amc, cat_columna cc WHERE amc.col_id = cc.col_id and amc.apimetodcamp_status = 1 and amc.apimetodcamp_key = "+tipo+" and ',"+columnas+",' like concat('%,',col_nombre,',%');");
    //return helpers.mysqlQuery('GET', conn_mysql, "SELECT distinct cc.col_nombre FROM api_metodo_campo amc, cat_columna cc WHERE amc.col_id = cc.col_id and amc.apimetodcamp_status = 1 and amc.apimetodcamp_key = "+tipo+" and ',"+columnas+",' like CONCAT('%', cc.col_nombre ,'%');");
}
