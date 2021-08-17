'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../midlewares/config')

function createToken(user) {
    const payload = {
        sub: user.usu_id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    }
    return jwt.encode(payload, config.E_TOKEN)
}

function decodeToken(token) {
    const decoded = new Promise((resolve, reject) => {
        try {
            const payload = jwt.decode(token, config.E_TOKEN)
            if (payload.exp < moment().unix()) {
                reject({
                    status: 401,
                    message: 'El token ha expirado'
                })
            }
            resolve(payload.sub)

        } catch (err) {
            reject({
                status: 500,
                message: 'Invalid Token'
            })
        }
    })
    return decoded;
}
module.exports = {
    createToken: createToken,

    decodeToken: decodeToken
};