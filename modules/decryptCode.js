'use strict'
const crypto = require('crypto');
const config = require('../midlewares/config')

function decrypData(palabra, resolve) {
  try {
      let dataRemplace = palabra.replace(/code/g, "/");
      var llave = new Buffer(config.E_KEY).toString('binary');
      var cipher = crypto.createDecipheriv('aes-128-ecb', llave, '');
      return JSON.parse(cipher.update(dataRemplace, 'base64', 'utf8') + cipher.final('utf8'));
  } catch (e) {
      return({
          err: true,
          descripcion: "No se pudo decifrar tu palabra"
      });
  }
}


function decrypDataGet(palabra) {
  try {
    var llave = new Buffer(config.E_KEY).toString('binary');
      var cipher = crypto.createDecipheriv('aes-128-ecb', llave, '');
      return JSON.parse(cipher.update(palabra, 'base64', 'utf8') + cipher.final('utf8'));
  } catch (e) {
      return({
          err: true,
          descripcion: "No se pudo decifrar tu palabra"
      });
  }
}

function encryptData(palabra) {
  try {
      var llave = new Buffer(config.E_KEY).toString('binary');
      let data = JSON.stringify(palabra);
      var cipher = crypto.createCipheriv('aes-128-ecb', llave, '');
      var response = cipher.update(data, 'utf8' ,'base64');
      response += cipher.final('base64')
      return {  response };
  } catch (e) {
      return ({
          err: true,
          descripcion: "No se pudo cifrar tu palabra"
      });
  }
}


function decrypt(palabra, resolve) {
  try {
      var llave = new Buffer(config.E_KEY).toString('binary');
      var cipher = crypto.createDecipheriv('aes-128-ecb', llave, '');
      return cipher.update(palabra, 'base64', 'utf8') + cipher.final('utf8');
  } catch (e) {
      resolve({
          err: true,
          descripcion: "No se pudo decifrar tu palabra"
      });
  }
}

function encryptData(palabra) {
  try {
      let data = JSON.stringify(palabra);
      //console.log("palabra", JSON.stringify(palabra))
      //var llave = new Buffer('MROIL6CFST88ITBV').toString('binary');
      var cipher = crypto.createCipheriv('aes-128-ecb', config.E_KEY, '');
      var response = cipher.update(data, 'utf8' ,'base64');
      response += cipher.final('base64')
      return {  response };
  } catch (e) {
      return ({
          err: true,
          descripcion: "No se pudo cifrar tu palabra"
      });
  }
}

async function decryptReturn(resultadoPost){

  let keys = "";
  let objetoTemp = resultadoPost[0];
  keys = Object.keys(objetoTemp);
  //Validar si hay campos con tipo 5 (desencriptar)

  var returnDecrypt = await apiAdminModel.getParamsMetodoType(keys.join(','),5).then(function (result) {
          if (!result.err) {
              var paramsApi = result.result;
              if(paramsApi.length > 0){
                  let regresoQry = resultadoPost.map(function(elem){
                                      for(let campo of paramsApi){
                                          elem[campo.col_nombre] = decrypDataGet(elem[campo.col_nombre]);
                                      }
                                      return elem;
                                  });
                  return regresoQry;
                  /*resolve({
                      valido: 1,
                      mensaje: "Datos correctos",
                      addenda: regresoQry
                  });*/
              } else {
                  return resultadoPost;
                  /*resolve({
                      valido: 1,
                      mensaje: "Datos correctos",
                      addenda: resultadoPost
                  });*/
              }
          } else {
              return null;
              /*
              resolve({
                  valido: 0,
                  mensaje: "No existen datos, favor de verificar",
              });        
              */
          }
      }); //fin getParamsMetodoType
  
  return returnDecrypt;
}

/*
function decrypt(palabra, resolve) {
  try {
    let desencripta = palabra.split('code').join('/')
    var llave = new Buffer('iR3fZ5gY9qT5dX2w').toString('binary');
    var cipher = crypto.createDecipheriv('aes-128-ecb', llave, '');
    var encryptdata = cipher.update(desencripta, 'base64', 'utf8')
    encryptdata += cipher.final('utf-8')
    return encryptdata;
  } catch (e) {
    console.log("erro->" + e)
    resolve({
      err: true,
      descripcion: "Encryption error"
    });
  }
}

function decrypData(palabra) {
  try {
    console.log("*************,", palabra)
    let dataRemplace = palabra.replace(/code/g, "/");
    var llave = new Buffer('eI3kI7tJ1pS2zS4m').toString('binary');
    var cipher = crypto.createDecipheriv('aes-128-ecb', llave, '');
    return JSON.parse(cipher.update(dataRemplace, 'base64', 'utf8') + cipher.final('utf8'));
  } catch (e) {
    return ({
      err: true,
      descripcion: "No se pudo decifrar tu palabra"
    });
  }
}



function encryptData(palabra) {
  try {

    let data = JSON.stringify(palabra);
    var cipher = crypto.createCipheriv('aes-128-ecb', 'eI3kI7tJ1pS2zS4m', '');
    var response = cipher.update(data, 'utf8', 'base64');
    response += cipher.final('base64')
    return { response };
  } catch (e) {
    return ({
      err: true,
      descripcion: "No se pudo cifrar tu palabra"
    });
  }
}
*/

module.exports = {
  encryptData: encryptData,
  decrypt: decrypt,
  decryptReturn: decryptReturn,
  decrypData: decrypData,
  encryptData: encryptData
};