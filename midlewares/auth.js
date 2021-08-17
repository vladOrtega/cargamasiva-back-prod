'use strict'


const encryptToken = require('../modules/encryptToken');

function isAuth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: "No tienes autorización"
        });
    }
    const token = req.headers.authorization.split(" ")[1]
    encryptToken.decodeToken(token)
        .then(response => {
            req.user = response;
            next();
        })
        .catch(response => (response.status))
}

module.exports = {
    isAuth: isAuth
};