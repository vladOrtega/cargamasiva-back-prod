'use strict'
const helpers = require('../modules/helpers');

module.exports = {
    setFunciones: setFunciones,
    getParamsFunciones: getParamsFunciones
}

function setFunciones(){
    return helpers.mysqlQuery('GET', conn_mysql, `call getMetodos();`);
}

function getParamsFunciones(metodo) {
    return helpers.mysqlQuery('GET', conn_mysql, "SELECT amc.*, cc.col_nombre, cc.tbl_id FROM api_metodo_campo amc, cat_columna cc WHERE amc.col_id = cc.col_id and amc.apimetodcamp_status = 1 and apimetod_id = '" + metodo.apimetod_id + "';", '');
}