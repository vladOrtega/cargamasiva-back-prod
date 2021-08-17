'use strinct'
const helpers = require('../modules/helpers');

module.exports = {
    getSettings: getSettings
}

function getSettings() {
    return helpers.mysqlQuery('GET', conn_mysql,
        `select * from setting where st_status = 1 order by 1 `
    )
}