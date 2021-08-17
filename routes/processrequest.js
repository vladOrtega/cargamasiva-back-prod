'use strict'

var express = require('express');
var router = express.Router();
var processrequestCtrl = require('../controllers/processrequest');
const mngError = require('../modules/errorsDesc');
const path = require('path');
const multipart = require('connect-multiparty');
const crypt = require('../modules/decryptCode');
const imagenesTemporal = multipart({
    uploadDir: path.join(__dirname, '../media/temporal')
})

router.post('/processrequest-add', resolveProcessRequest)
router.post('/validateUser', validateUser)
router.post('/apipost/:metodo', apiPost)
router.get('/apiget/:metodo', apiGet)
router.post('/apipostfile/:metodo', imagenesTemporal, apiPostFile)

function resolveProcessRequest(req, res) {
    var d = req.body;
    processrequestCtrl.resolveProcessRequest(d)
        .then(function (result) {
            res.json(result)
        })
}

function validateUser(req, res){
    var d = req.body;
    processrequestCtrl.validateUser(d)
        .then(function (result) {
            res.json(result)
        }).catch(error => {
            let msjError = mngError['e' + error].desc;
            res.statusCode = error;
            res.json({valido: 0, mensaje: msjError })
        })
}

function apiPost(req, res) {
    let d = req.body;
    if(d.dataEnc) {
        let dataDecrypt = crypt.decrypData(d.dataEnc);
        d = dataDecrypt;
    }
    let metodo = req.params.metodo;
    processrequestCtrl.apiPost(metodo, d)
        .then(function (result) {
            res.json(result)
        }).catch(error => {
            let msjError = mngError['e' + error].desc;
            res.statusCode = error;
            res.json({valido: 0, mensaje: msjError })
            
        })
}

function apiGet(req, res) {
    let metodo = req.params.metodo;
    processrequestCtrl.apiGet(metodo)
        .then(function (result) {
            res.json(result)
        }).catch(error => {
            let msjError = mngError['e' + error].desc;
            res.statusCode = error;
            res.json({valido: 0, mensaje: msjError })
            
        })
}

function apiPostFile(req, res) {
    let d = JSON.parse(req.body.objeto);
    let file = req.files.file;
    let metodo = req.params.metodo;
    processrequestCtrl.apiPostFile(metodo, d, file)
        .then(function (result) {
            res.json(result);
        })
}

module.exports = router;