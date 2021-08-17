'use strict'

const express = require('express');
const app = express();
//const main = require('./models/main');
const api = require('./api');
const files = require('./files')
const main = require('./models/main');

//cabeceras de acceso de http
const puerto = 5002;
global.Metodos = [];

const AccionModel = require('./models/accion.model');

app.set('port', (process.env.PORT || puerto))
main.start()
  .then(function () {
  
    AccionModel.setFunciones().then(async function (result) {
      if (!result.err) {
        global.Metodos = result.result[0];
        for (const metodo of global.Metodos) {
            let regreso = await AccionModel.getParamsFunciones(metodo);
            metodo.parametros = regreso.result;
        }
        //console.log(global.Metodos);
        console.log("finish load");
      }else{
        console.log("Error status: " + result.err);
      }
    })

    app.start = app.listen(app.get('port'), function () {
      console.log("Application started on port:", puerto);
    });
     
  });
/*main.start()
  .then(function () {
    app.start = app.listen(app.get('port'), function () {
      console.log("Escuchando en el puerto", puerto);
    });
  });*/
//app.start = app.listen(app.get('port'), function () {
//  console.log("Escuchando en el port", puerto);
//});
//rutas declaradas para el uso de rutas y archivos media
module.exports = app;
app.use(api);
app.use(files);