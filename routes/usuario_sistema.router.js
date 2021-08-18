const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth');
const UsuarioSistemaCtrl = require('../controllers/usuario.consola.controller');
const crypt = require('../modules/decryptCode');

//router.post('/IniciarSesion', iniciarSesion);
router.get('/session_username/:username/:nip', getUsuarioSession);
router.get('/session_username_val/:codigo', getUsuarioSessionVal);
router.get('/obtenerUsuarios', obtenerUsuarios);
router.post('/usuario-sistema-add', auth.isAuth, Add);
router.post('/usuario-sistema-update', auth.isAuth, Update);
router.get('/obtenerPerfilesConsola', auth.isAuth, obtenerPerfilesConsola);

function getUsuarioSession(req, res) {
    var userName = req.params.username;
    var nip = req.params.nip;
    UsuarioSistemaCtrl.getUsuarioSession({
            username: userName,
            nip: nip
        })
        .then(function (result) {
            res.json(result)
        })
}

function getUsuarioSessionVal(req, res) {
    var code = req.params.codigo;
    UsuarioSistemaCtrl.getUsuarioSessionVal({
            code: code
        })
        .then(function (result) {
            let dataEncrypt = crypt.encryptData(result);
            res.json(dataEncrypt.response)
        })
}

function obtenerUsuarios(req, res) {
    UsuarioSistemaCtrl.obtenerUsuarios()
        .then(function (result) {
            res.json(result);
        })
}

function Add(req, res) {
    let datos = req.body;
    UsuarioSistemaCtrl.Add(datos)
        .then(function (result) {
            res.json(result);
        })
}

function Update(req, res) {
    let datos = req.body;
    //datos =  crypt.decrypData(datos);
    UsuarioSistemaCtrl.Update(datos)
        .then(function (result) {
            res.json(result);
        })
}

function obtenerPerfilesConsola(req, res) {
    UsuarioSistemaCtrl.obtenerPerfilesConsola()
        .then(function (result) {
            res.json(result);
        })
}
module.exports = router;