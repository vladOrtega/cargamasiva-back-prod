'use strict'
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');

//Import MODELS
const Settings = require('./setting.comtroller');
const apiAdminModel = require('../models/api_admin.model');
const archivoModel = require('../models/archivo.model');
const path = require('path');
const fs = require('fs')
const shell = require('shelljs');
const imageThumbnail = require('image-thumbnail');
const encrypt = require('../modules/decryptCode')
const apiUserConsolaModel = require('../models/api_user.consola.model');
const service = require('../modules/encryptToken');
//const jsonrcp = require('../midlewares/json-rpc-client');
const SimplyBook = require("simplybook-js-api");
let axios = require('axios');
const https = require('https')

const { json } = require('express');

const urlSB = "https://user-api.simplybook.plus";
const urlSB2 = "https://user-api-v2.simplybook.plus";

let settingsAxios = { timeout: 60000 }

module.exports = {
    resolveProcessRequest: resolveProcessRequest,
    resolveSimplyBook: resolveSimplyBook,
    deleteSimplyBook: deleteSimplyBook,
    validateUser: validateUser,
    apiPostFile: apiPostFile,
    apiPost: apiPost,
    apiGet: apiGet
}

function resolveProcessRequest(data) {
    return new Promise(async function (resolve, reject) {
        let clearData = data.palabra.split(' ').join('+')
        let dataArray = encrypt.decryptCode(clearData, resolve).split("|");

        if (dataArray != undefined && dataArray != "") {
            if (dataArray[0] == 100) {
                Settings.getSettings()
                    .then(function (result) {
                        resolve(result);
                    });
            }
            if (dataArray[0] == 201){
                //console.log(dataArray)
                let jsonXLS = await readXLS(dataArray);
                if(jsonXLS){
                    resolve({
                        valido: 1,
                        mensaje: "Archivo procesado",
                        addenda: jsonXLS
                    })
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "Error al procesar el archivo"
                    })
                }

            }
        } else {
            resolve({
                valido: 0,
                mensaje: "Error al procesar la peticion"
            })
        }
    })
}

function validateUser(datos) {
    cocnsole.log("Datos llegando a funcion", datos);
    return new Promise(function (resolve, reject) {
        if (datos.key) {
            //Validar Key
            apiUserConsolaModel.validateUserKey(datos.key).then(function (result) {
                if (!result.err) {
                    let validaUser = result.result;
                    if (validaUser.length > 0) {
                    
                        let datos = {
                            usu_id: validaUser[0].api_user_id,
                            api_user_name: validaUser[0].api_user_name
                        }
                        console.log("Datos del usuario validados", datos);
                        resolve({
                            valido: 1,
                            mensaje: "Datos correctos",
                            token: service.createToken(datos),
                            test: global.Metodos
                            //addenda: validaUser
                        });
                    } else {
                        resolve({
                            valido: 0,
                            mensaje: "Llave no válida"
                        });
                    }
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "Error al obtener los datos, intente nuevamente"
                    });
                }
            });
        } else {
            reject("400");
        
        }
    })
}

function getNip(datosUsr) {
    bcrypt.hash(datosUsr.uNip, null, null, function (err, hash) {
        if (err) {
            return resolve({
                error: 'Error no se pudo generar la contraseña (bcrypt)'
            });
        } else {
            console.log("nip->", hash)
            //datosUsr.uNip = hash;
        }
    })
}

function apiGet(metodo) {
    return new Promise(function (resolve, reject) {
        //Valida que el metodo exista
        //apiAdminModel.validateMetodo(metodo, 'get').then(function (result) {
            let result = apiAdminModel.validateMetodo(metodo, 'get');
            if (!result.err) {
                let metodoApi = result.result;
                if (metodoApi.length > 0) {
                    //Ejecuta query:
                    //let query = metodoApi[0].apimetod_store + " ";
                    let query = metodoApi[0].apimetod_store + ";";
                    apiAdminModel.executeStored(query).then(function (result) {
                        if (!result.err) {
                            if (result.result.length > 0) {
                                resolve({
                                    valido: 1,
                                    mensaje: "Datos correctos",
                                    addenda: result.result
                                });
                            } else {
                                resolve({
                                    valido: 0,
                                    mensaje: "No existen datos, favor de verificar",
                                });
                            }
                        } else {
                            resolve({
                                valido: 0,
                                mensaje: "Error al ejecutar la consulta, favor de verificar",
                            });
                        }
                    });
                } else {
                    reject("404");
                }
            } else {
                reject("405");
            }
    });
}

function apiPost(metodo, d) {
    console.log(d);
    return new Promise(async function (resolve, reject) {
        //console.log("-->" + JSON.stringify(metodo));
        //Valida que el metodo exista
        let result = apiAdminModel.validateMetodo(metodo, 'post');
        //apiAdminModel.validateMetodo(metodo, 'post').then(function (result) {
            if (!result.err) {
                let metodoApi = result.result;
                if (metodoApi.length > 0) {
                    //Obtener parametros
                    //apiAdminModel.getParamsMetodo(metodoApi[0]).then(async function (result) {
                        result = apiAdminModel.getParamsMetodo(metodoApi[0]);
                        if (!result.err) {
                            let paramsApi = result.result;
                            let parametrosEntrada = 0;
                            //Validacion tipo de campo
                            let valorEncriptar = '';
                            let campoEncriptar = '';
                            let valorJSON = '';
                            let valorIndice = 0;
                            
                            //if(paramsApi.length == Object.keys(d).length){
                                // for para buscar un 4
                                for (const value of paramsApi) {
                                    //tienne hash password?
                                    if (value.apimetodcamp_key == 4) {
                                        valorEncriptar = d[value.apimetodcamp_nombre];
                                        campoEncriptar = value.apimetodcamp_nombre;
                                        if (valorEncriptar.length < 20) {
                                            // bcrypt async
                                            var hashNew = bcrypt.hashSync(valorEncriptar, 10); //getNip({ password: valorEncriptar });
                                            if (hashNew) {
                                                d[campoEncriptar] = hashNew;
                                            }
                                        }
                                    }
                                    //tienne encriptar valor?
                                    if (value.apimetodcamp_key == 5) {
                                        valorEncriptar = d[value.apimetodcamp_nombre];
                                        campoEncriptar = value.apimetodcamp_nombre;
                                        if(valorEncriptar){
                                            // bcrypt async
                                            //var hashNew = bcrypt.hashSync(valorEncriptar, 10); //getNip({ password: valorEncriptar });
                                            var hashNew = encrypt.encryptData(valorEncriptar);
                                            if(hashNew){
                                                d[campoEncriptar] = hashNew.response;
                                            }
                                        }
                                    }
                                    //tiene carga masiva?
                                    if(value.apimetodcamp_key == 6 || value.apimetodcamp_key == 7){
                                        valorJSON = d[value.apimetodcamp_nombre];
                                        if(valorJSON){
                                            //convertir a JSON
                                            valorJSON = JSON.parse(valorJSON);
                                        }
                                        if(value.apimetodcamp_key == 7) valorIndice = 1;
                                    }
                                }

                                let arryError = [];
                                let arryInsert = [];
                                let arryReturn = [];
                                let indexInsert = 0;
                                if(valorJSON){
                                    //masaivo
                                    for(let objJSON of valorJSON){
                                        arryInsert.push(objJSON);
                                    }
                                } else {
                                    //meter push a array
                                    let objeto = new Object();
                                    for (const value of paramsApi) {
                                        if(d[value.apimetodcamp_nombre]) objeto[value.apimetodcamp_nombre] = d[value.apimetodcamp_nombre];
                                    }
                                    arryInsert.push(objeto);
                                }
                                //quitar tipo 6 de arrays
                                paramsApi = paramsApi.filter(function( obj ) {
                                    return obj.apimetodcamp_key !== 6;
                                });
                                //quitar tipo 7 de arrays
                                paramsApi = paramsApi.filter(function( obj ) {
                                    return obj.apimetodcamp_key !== 7;
                                });
                                for(const item of arryInsert){
                                    parametrosEntrada = 0;
                                    let arrParams = [];
                                    //Concatena valores para stored
                                    //paramsApi.forEach(function (value, i) {
                                    for (const value of paramsApi) {
                                        if (item.hasOwnProperty(value.apimetodcamp_nombre)) {
                                            let cadena = " @" + value.apimetodcamp_nombre + " = '" + item[value.apimetodcamp_nombre] + "'";
                                            arrParams.push(cadena);
                                            //arrParams.push(d[value.apimetodcamp_nombre]); 
                                            parametrosEntrada++;
                                        }
                                    }

                                    if(valorIndice == 1){
                                        //Agregar parametro indicador Indice
                                        if(indexInsert == (arryInsert.length-1)) arrParams.push( "@index = "+valorIndice);
                                        else arrParams.push( " @index = 0");
                                    }
                                    
                                    if (parametrosEntrada == paramsApi.length) {
                                        //Ejecuta query:
                                        //let query = metodoApi[0].apimetod_store + "(" + arrParams.toString() + ")";
                                        let query = metodoApi[0].apimetod_store + arrParams.toString();
                                        let regresoQ = await executeQuery(query, metodoApi[0].apimetod_id);
                                        let errorQ = false; 
                                        if(regresoQ){
                                            if(regresoQ.length == 1){
                                                if(regresoQ[0].hasOwnProperty('valido')){
                                                    if(regresoQ[0].valido == 0) {
                                                        errorQ = true;
                                                        item.error = regresoQ[0].mensaje;
                                                    }
                                                }
                                            } 
                                            if(regresoQ && !errorQ) {
                                                if(regresoQ.length > 1) arryReturn = Object.assign([], regresoQ);
                                                else if(regresoQ.length == 1) arryReturn.push(regresoQ[0]);
                                            }
                                            else arryError.push(item);
                                        } 
                                    } else {
                                        item.error = "Error en los parametros, favor de verificar";
                                        arryError.push(item);
                                        
                                    } // parametrosEntrada = length
                                    indexInsert++;
                                } //for array
                                let tmpValido = 1;
                                if (arryError.length > 0) { 
                                    tmpValido = 0; 
                                    reject('400');
                                } else {
                                    if(valorIndice == 1){
                                        arryReturn = arryReturn.pop();  
                                    }
                                    resolve({
                                        valido: tmpValido,
                                        addenda: arryReturn,
                                        errores: arryError
                                    })
                                }
                            //} else {
                            //    reject('400');
                            //}
                        } else {
                            resolve({
                                valido: 0,
                                mensaje: "Error al obtener los datos, intente nuevamente"
                            });
                        }
                    //});
                } else {
                    reject("404");
                    
                }
            } else {
                reject("405")
                
            }

    });
}

/*
  apimetodcamp_key:
      1 primary key
      2 image (ruta de la imagen donde se va a guardar, la peticion debe de traer la ruta
                donde se va guardar en el server media\xxxx y la genera automaticamente si no existe
                y se guarda la ruta en este mismo campo ya con el nombre de la imagen)
      3 thumbnail (ruta de la imagen donde se va guardar el thumbnail, la imagen que se
                manda y se guarda la ruta en este mismo campo ya con el nombre de la imagen)
      4 hash password
      5 encriptar valor
      6 json array masivo
      7 json array masivo con indice de respuesta (ultimo indice regresa lo que regresa el stored cuando index = 1)
*/
function apiPostFile(metodo, d, file) {
    return new Promise(async function (resolve, reject) {
        //Valida que el metodo exista
        let result = apiAdminModel.validateMetodo(metodo, 'postfile');
        //apiAdminModel.validateMetodo(metodo, 'postfile').then(function (result) {
            if (!result.err) {
                let metodoApi = result.result;
                if (metodoApi.length > 0) {
                    //Obtener parametros
                    result = apiAdminModel.getParamsMetodo(metodoApi[0]);
                    //apiAdminModel.getParamsMetodo(metodoApi[0]).then(function (result) {
                        if (!result.err) {
                            let urlFinal = "";
                            let campoUrl = "";
                            let urlFinalThumb = "";
                            let campoURLThumb = "";
                            let paramsApi = result.result;
                            let parametrosEntrada = 0;
                            let arrParams = [];
                            for (const value of paramsApi) {
                                //tienne image?
                                if (value.apimetodcamp_key == 2) {
                                    urlFinal = d[value.apimetodcamp_nombre];
                                    campoUrl = value.apimetodcamp_nombre;
                                }
                                //tiene thumbail?
                                if (value.apimetodcamp_key == 3) {
                                    urlFinalThumb = d[value.apimetodcamp_nombre];
                                    campoURLThumb = value.apimetodcamp_nombre;
                                }
                            }
                            //Checa si el path destino no existe
                            if (urlFinal) {

                                if (!urlFinal.includes('.')) {
                                    if (!fs.existsSync(urlFinal)) {
                                        //crea el path
                                        shell.mkdir('-p', urlFinal);
                                    }
                                    //Upload File files.path,files.name,
                                    if (file && urlFinal) {
                                        let filename = path.basename(file.path);
                                        urlFinal = urlFinal + filename;
                                        fs.copyFileSync(file.path, urlFinal);
                                        console.log('Successfully renamed - file!')
                                        d[campoUrl] = urlFinal;
                                    }
                                }
                            }
                            //upload Thumbnail
                            let makeThumb = null;
                            if (file && urlFinalThumb) {
                                if (!fs.existsSync(urlFinalThumb)) {
                                    //crea el path
                                    shell.mkdir('-p', urlFinalThumb);
                                }
                                let filename = path.basename(file.path);
                                let thumbname = urlFinalThumb + filename;
                                makeThumb = makeThumbFunc(file, urlFinalThumb);
                                if (makeThumb) {
                                    d[campoURLThumb] = thumbname;
                                }
                            }
                            //Delete temporal
                            if (makeThumb || urlFinal.includes('.')) {
                                fs.unlinkSync(file.path);
                            }

                            //paramsApi.forEach(function (value, i) {
                            for (const value of paramsApi) {
                                if (d.hasOwnProperty(value.apimetodcamp_nombre)) {
                                    let cadena = " @" + value.apimetodcamp_nombre + " = '" + d[value.apimetodcamp_nombre] + "'";
                                    arrParams.push(cadena);
                                    //arrParams.push(d[value.apimetodcamp_nombre]);
                                    parametrosEntrada++;
                                }
                            }

                            //Save Data
                            if (parametrosEntrada == paramsApi.length) {
                                //Ejecuta query:
                                //let query = metodoApi[0].apimetod_store + "(" + arrParams.toString() + ")";
                                let query = metodoApi[0].apimetod_store + arrParams.toString();
                                let regresoQ = await executeQuery(query, metodoApi[0].apimetod_id);
                                //apiAdminModel.executeStored(query).then(function (result) {
                                    //console.log("----",regresoQ)
                                    let regreso = regresoQ;
                                    if (regresoQ) {
                                        resolve({
                                            valido: 1,
                                            mensaje: "Datos correctos",
                                            addenda: regreso
                                        });
                                    } else {
                                        resolve({
                                            valido: 0,
                                            mensaje: "Error al ejecutar la consulta, favor de verificar",
                                        });
                                    }
                                //});

                            } else {
                                resolve({
                                    valido: 0,
                                    mensaje: "Error en los parametros, favor de verificar",
                                });
                            }

                        } else {
                            resolve({
                                valido: 0,
                                mensaje: "Error al obtener los datos, intente nuevamente"
                            });
                        }
                    //});
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "Error, No existe el metodo"
                    });
                }
            } else {
                resolve({
                    valido: 0,
                    mensaje: "Error al obtener los datos, intente nuevamente"
                });
            }
        //});

    });
}

function deleteSimplyBook(dataArray){
    return new Promise(async function (resolve, reject) {
        
        if (dataArray) {
            //ceonceta a simplybook
            let _sucursal = await archivoModel.obtenSucursal({suc_id: dataArray.suc_id});
            //console.log(_sucursal);
            _sucursal = _sucursal.result[0];
            let tokenSB = await getTokenSB(_sucursal);
            //console.log(tokenSB.token, dataArray);
            delete dataArray.suc_id;
            console.log(tokenSB.token, dataArray,_sucursal);
            let regreso = await delWorkDaySB(dataArray, tokenSB.token, _sucursal);
            console.log(regreso)
            if(regreso.respuesta){
                resolve({
                    valido: 1,
                    mensaje: "Borrado correcto",
                })
            } else {
                resolve({
                    valido: 0,
                    mensaje: "Error al borrar a SimplyBook",
                })
            }

        } else {
            resolve({
                valido: 0,
                mensaje: "Error al procesar la petición"
            })
        }
    })
}

function resolveSimplyBook(dataArray){
    return new Promise(async function (resolve, reject) {
        
        if (dataArray) {
            //ceonceta a simplybook
            let _sucursal = await archivoModel.obtenSucursal({suc_id: dataArray.suc_id});
            _sucursal = _sucursal.result[0];
            let tokenSB = await getTokenSB(_sucursal);
            if(tokenSB.valor == 1){
                delete dataArray.suc_id;
                let regreso = await setWorkDaySB(dataArray, tokenSB.token, _sucursal);
                if(regreso.respuesta){
                    resolve({
                        valido: 1,
                        mensaje: "Ingreso correcto",
                    })
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "Error al ingresar a SimplyBook",
                    })
                }
    
            } else {
                resolve({
                    valido: 0,
                    mensaje: "Error al obtener el token",
                })
            }
            //console.log(tokenSB.token, dataArray);
            
        } else {
            resolve({
                valido: 0,
                mensaje: "Error al procesar la petición"
            })
        }
    })
}

async function makeThumbFunc(file, urlFinalThumb) {

    let makeThumb = await imageThumbnail(file.path).then(thumbnail => {
        let filename = path.basename(file.path);
        let thumbname = urlFinalThumb + filename;
        fs.writeFile(thumbname, thumbnail, 'base64', function (err) {
            if (err) {
                console.log(err);
            } else {
                //d[campoURLThumb] = thumbname;
                console.log("Exito Thumbnail");
            }
        });
    }).catch(err => console.error(err));

    return makeThumb;
}

async function executeQuery(query, metodoID){

    var returnQuery = await apiAdminModel.executeStored(query).then(function (result) {
            if (!result.err) {
                let resultadoPost = result.result;
                if(resultadoPost){
                    if(resultadoPost.length > 0){
                        let regresoD = decryptReturn(resultadoPost, metodoID) 
                        if(regresoD) return regresoD;
                    } else return null;
                } else return null;
            } else {
                return null;
                /*resolve({
                    valido: 0,
                    mensaje: "Error al ejecutar la consulta, favor de verificar",
                });*/
            } //if result.err
        }); // executeStored

    return returnQuery;
}

async function decryptReturn(resultadoPost, metodoID){
    let keys = "";
    let objetoTemp = resultadoPost[0];
    keys = Object.keys(objetoTemp);
    //Validar si hay campos con tipo 5 (desencriptar)

    //var returnDecrypt = apiAdminModel.getParamsMetodoType(keys.join(','),5,metodoID).then(function (result) {
    var result = apiAdminModel.getParamsMetodoType(keys.join(','),5,metodoID);
            if (!result.err) {
                if(result.result.length > 0){
                    var paramsApi = result.result[0];
                    if(paramsApi.length > 0){
                        let regresoQry = resultadoPost.map(function(elem){
                                            for(let campo of paramsApi){
                                                elem[campo.col_nombre] = decrypDataGet(elem[campo.col_nombre]);
                                            }
                                            return elem;
                                        });
                        return regresoQry;
                    } else {
                        return resultadoPost;
                    }
                }
                else return resultadoPost;
            } else {
                return null;
            }
    //}); //fin getParamsMetodoType
  }



  async function readXLS(datos){

    //obtener sucursales permitidas
    var sucursalesFile = await archivoModel.obtenSucursales(datos[1]);
    if(!sucursalesFile.err){
        sucursalesFile = sucursalesFile.result
    } else {
        return null;
    }
    var workbook = XLSX.readFile(datos[2]);
    var sheet_name_list = workbook.SheetNames;
    var json_workbook = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: false});
    //console.log(json_workbook);
    //validar sucursales
    //console.log(sucursalesFile);
    for(let i=0; i<json_workbook.length; i++){
        let suc = sucursalesFile.filter(s => s.suc_empresa == json_workbook[i].sucursal);
        json_workbook[i].valido = 1;
        if(suc.length == 0){
            json_workbook[i].valido = 0;
        } else {
            if(suc.length > 0) suc = suc[0];

            //console.log(json_workbook[i], suc)
            //valida formato hora
            let re = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');
            let vIni = re.test(json_workbook[i].hora_inicio);
            let vFin = re.test(json_workbook[i].hora_fin);
            if(!vIni || !vFin) json_workbook[i].valido = 0; 
            if(vIni && vFin){
                let date = new Date(Date.parse(json_workbook[i].fecha + " 12:00:00"));
                let dateNumber = date.getDay();
                console.log("fecha",date, dateNumber, json_workbook[i].hora_inicio, json_workbook[i].hora_fin);
                let dateSucIni = new Date(date);
                //Fecha invalida - domingo
                if(dateNumber == 0) { json_workbook[i].valido = 0; console.log("dom"); }
                if(dateNumber >= 1 && dateNumber < 6) dateSucIni.setHours(suc.suc_ini_lv.split(':')[0], suc.suc_ini_lv.split(':')[1], '00');
                else if (dateNumber == 6) dateSucIni.setHours(suc.suc_ini_s.split(':')[0], suc.suc_ini_s.split(':')[1], '00');
                let dateSucFin = new Date(date);
                if(dateNumber >= 1 && dateNumber < 6) dateSucFin.setHours(suc.suc_fin_lv.split(':')[0], suc.suc_fin_lv.split(':')[1], '00');
                else if (dateNumber == 6) dateSucFin.setHours(suc.suc_fin_s.split(':')[0], suc.suc_fin_s.split(':')[1], '00');
                //horario ocupado:
                let dateIni = new Date(date);
                let dataFin = new Date(date);
                dateIni.setHours(json_workbook[i].hora_inicio.split(':')[0], json_workbook[i].hora_inicio.split(':')[1], '00');
                dataFin.setHours(json_workbook[i].hora_fin.split(':')[0], json_workbook[i].hora_fin.split(':')[1], '00');
                //valida hora ini es menor a hora fin
                if(dataFin < dateIni) { json_workbook[i].valido = 0; console.log("hini menor hfin");}
                //valida sucursal
                if(dateSucIni > dateIni) { json_workbook[i].valido = 0; console.log("sucini > ini");}
                if(dateSucFin < dataFin) { json_workbook[i].valido = 0; console.log("sucfin < fin");}
                //valida borrado
                if(json_workbook[i].hora_inicio == '0:00' && json_workbook[i].hora_fin == '0:00') json_workbook[i].valido = 1;
            }
        }

    }
    //regresar json
    return json_workbook;
  }

  async function getTokenSB(datos){
    
    return new Promise(async function (resolve, reject) {

        let genera = 0;
        if(datos.suc_tokenSB != '0'){
         
            var data = JSON.stringify({
                jsonrpc:"2.0",
                method: "getUserToken",
                "params": [datos.suc_empresa, datos.suc_sb_login, datos.suc_sb_apikey],
                id:1
            });   
            var config = {
                method: 'post',
                url: `https://user-api.simplybook.plus/login/`,
                headers: { 
                    'Content-Type': 'application/json'                           
                },
                data : data
            };
            let newTokenResult=''
            await  axios(config)
            .then(function (response) {
                newTokenResult = response.data.result
              })
              .catch(function (error) {
                  console.log(error);
              });

              if(!newTokenResult){
                  resolve({valor:0, error:'No se pudo obtener token de SimplyBook'});
              } else {
                  resolve({valor:1, token:newTokenResult });
              }
        
        } else {
            genera = 1;
        }
        if(genera == 1){
            let password = encrypt.decrypt(datos.suc_password);
            let data2 = {
                "company": datos.suc_empresa,
                "login": datos.suc_usuario,
                "password": password
            };

            const res = await axios.post(urlSB2 + "/admin/auth", data2, settingsAxios);
            let uptFile= await archivoModel.insertTokenDB(res.data.refresh_token, datos.suc_id);
            resolve({valor: 1, token: res.data.token});
            /*
            console.log("------",password);
            let data = JSON.stringify({
                "jsonrpc": "2.0",
                "method": "getUserToken",
                "params": [
                datos.suc_empresa,
                datos.suc_usuario,
                password
                ],
                "id": 1
            });
            
            let config = {
                method: 'post',
                url: urlSB + '/login',
                headers: { 
                'Content-Type': 'application/json'
                },
                data : data
            };
            
            try {
                const resp = await axios(config);
                if(resp.data){
                    let token = resp.data;
                    let uptFile= await archivoModel.insertTokenDB(token.result, datos.suc_id);
                    resolve({valor: 1, token: token.result});
                }
    
            } catch (error) {
                // Handle Error Here
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    resolve({valor: 0, error: error.response.status});
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                    resolve({valor: 0, error: error.request});
                } else {
                    // Something happened in setting up the request that triggered an Error
                    resolve({valor: 0, error: error.message});
                    console.log('Error', error.message);
                }
            }
            */
        }
        

        
      
    });  

    /*
    const simplyBook = new SimplyBook(
        datos.suc_empresa,
        '407910534bd38222e81f3856584f22ac024e36dfe1d526a782914dcd0cbb4211',
        '2b670aeaa60b77f2ced356150702a75de24c884790d1788f8197800ad53ddb9c',
        datos.suc_usuario,
        datos.suc_password, 
        false);

    console.log(simplyBook);
    // 建立Auth Service
    let auth = simplyBook.createAuthService();
    
    // 取得Token
    let token = await auth.getToken();
    console.log(token);
    return token;
    */  

    //let url = urlSB.replace('{{empresa}}',datos.suc_empresa);
    /*
    var loginClient = new jsonrcp.JSONRpcClient({
        'url': urlSB + '/login',
        'onerror': function (error) {},
    });
    console.log("token--",loginClient)
    token = loginClient.getToken( datos.suc_usuario, datos.suc_password);
    console.log(token);
    return token;
    */
  }

  async function delWorkDaySB(datos, token, suc){
    return new Promise(async function (resolve, reject) {
        
        let data = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "deleteSpecialDay",
            "params": [
                datos.date,{"unit_group_id":datos.params.unit_group_id,"event_id":""}
            ],
            "id": 1
        });
        
        let config = {
            method: 'post',
            url: urlSB + '/admin/',
            timeout: 60000, //optional,
            headers: { 
                'X-User-Token': token, 
                'X-Company-Login': suc.suc_empresa, 
                'Content-Type': 'application/json'
            },
            data : data
        };
        console.log(datos.date, data);
        try {
            const resp = await axios(config);
            if(resp.data){
                let resultado = resp.data;
                resolve({valor: 1, respuesta: resultado.result});
            }

        } catch (error) {
            // Handle Error Here
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                resolve({valor: 0, error: error.response.status});
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                resolve({valor: 0, error: error.request});
            } else {
                // Something happened in setting up the request that triggered an Error
                resolve({valor: 0, error: error.message});
                console.log('Error', error.message);
            }
        }

        /*
        await axios(config)
        .then(function (response) {
            if(response.data){
                let resultado = response.data;
                resolve({respuesta: resultado.result});
            }
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                resolve({valor: 0, error: error.response.status});
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                resolve({valor: 0, error: error.request});
              } else {
                // Something happened in setting up the request that triggered an Error
                resolve({valor: 0, error: error.message});
                console.log('Error', error.message);
              }
        });*/
    }) 
  }

  async function setWorkDaySB(datos, token, suc){

    return new Promise(async function (resolve, reject) {
        
        let fecha = new Date(Date.parse(datos.date + " 12:00:00"));
        let dia = fecha.getDay();
        let sucIni = suc.suc_ini_lv;
        let sucFin = suc.suc_fin_lv;
        if(dia == 6) {
            sucIni = suc.suc_ini_s;
            sucFin = suc.suc_fin_s;
        }
        let data = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "setWorkDayInfo",
            "params": [
                {
                    "start_time": sucIni,
                    "end_time": sucFin,
                    "is_day_off": 0,
                    "breaktime": datos.breaktime,
                    "index": "",
                    "name": datos.date,
                    "date": datos.date,
                    "unit_group_id": datos.unit_group_id,
                    "event_id": ""
                }
            ],
            "id": 2
        });
        
        let config = {
            method: 'post',
            url: urlSB + '/admin/',
            timeout: 60000, //optional,
            headers: { 
                'X-User-Token': token, 
                'X-Company-Login': suc.suc_empresa, 
                'Content-Type': 'application/json'
            },
            httpsAgent: new https.Agent({ keepAlive: true }),
            data : data
        };
        console.log(fecha, dia, data);
        try {
            const resp = await axios(config);
            if(resp.data){
                let resultado = resp.data;
                resolve({valor: 1, respuesta: resultado.result});
            }

        } catch (error) {
            // Handle Error Here
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                resolve({valor: 0, error: error.response.status});
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                resolve({valor: 0, error: error.request});
            } else {
                // Something happened in setting up the request that triggered an Error
                resolve({valor: 0, error: error.message});
                console.log('Error', error.message);
            }
        }
        
        /*
        await axios(config)
        .then(function (response) {
            if(response.data){
                let resultado = response.data;
                resolve({valor: 1, respuesta: resultado.result});
            }
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                resolve({valor: 0, error: error.response.status});
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                resolve({valor: 0, error: error.request});
              } else {
                // Something happened in setting up the request that triggered an Error
                resolve({valor: 0, error: error.message});
                console.log('Error', error.message);
              }
            
        });
        */
    }) 
    /*
    let url = urlSB.replace('{{empresa}}',suc.suc_empresa);

    let client = new JSONRpcClient({
        'url': url + '/admin/',
        'headers': {
            'X-Company-Login': datos.suc_usuario,
            'X-User-Token': token
        },
        'onerror': function (error) {}
    });

    return client.setWorkDayInfo(datos);
    */
  }