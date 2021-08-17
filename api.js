const express = require('express');
const bodyParser = require('body-parser');
const api = express();
const cors = require('cors');

api.use(cors());
api.options('*', cors())
api.use(bodyParser.urlencoded({
    extended: true
}));
api.use(bodyParser.json());


api.use('/media', express.static(__dirname + '/media'));

//Rutas configuracion personalizado con parametros
const processrequest = require('./routes/processrequest');
api.use('/processrequest', processrequest)

const usuario_sistema = require('./routes/usuario_sistema.router');
api.use('/usuario_sistema', usuario_sistema);

module.exports = api;