'use strict'
const UsuarioSistemaModel = require('../models/usuario.consola.model');
const bcrypt = require('bcrypt');
const decrypt = require('../modules/decryptCode');
const service = require('../modules/encryptToken');

module.exports = {
    obtenerUsuarios: obtenerUsuarios,
    getUsuarioSessionVal: getUsuarioSessionVal,
    getUsuarioSession: getUsuarioSession,
    Add: Add,
    Update: Update,
    obtenerPerfilesConsola: obtenerPerfilesConsola
}


function getUsuarioSessionVal(dato){
    
    return new Promise(function (resolve, reject) {
        var clearData = dato.code.split(' ').join('+')
        var dataArray = decrypt.decrypt(clearData, resolve).split("|");
        let datos = { username: dataArray[0], nip: dataArray[1] };
        UsuarioSistemaModel.getUsuarioByUserName(datos)
            .then(function (result) {
                if (result.result.length > 0) {
                    //var hashNew = bcrypt.hashSync(datos.nip, 10);
                    //console.log(datos, hashNew, result.result[0])
                    bcrypt.compare(datos.nip, result.result[0].nip, function (err, res) {
                        if (res == true) {
                            if (result.result[0].usu_status == 1) {
                                delete result.result[0].nip
                                resolve({
                                    valido: 1,
                                    mensaje: "Datos Correctos",
                                    //token: '',
                                    token: service.createToken(datos),
                                    addenda: result.result[0]
                                });
                            } else if(result.result[0].usu_status) {
                                resolve({
                                    valido: 0,
                                    mensaje: "Your account has not been validated"
                                });
                            } else {
                                resolve({
                                    valido: 0,
                                    mensaje: "Your account is deactivated"
                                });
                            }
                        } else {
                            resolve({
                                valido: 0,
                                mensaje: "Incorrect Data"
                            });
                        }
                    });
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "User not registered"
                    });
                }
            })
    })

}

function getUsuarioSession(datos) {
    //login de session y comparacion de pw
    //console.log("2-->" + JSON.stringify(datos))
    return new Promise(function (resolve, reject) {
        UsuarioSistemaModel.getUsuarioByUserName(datos)
            .then(function (result) {
                if (result.result.length > 0) {
                    bcrypt.compare(datos.nip, result.result[0].nip, function (err, res) {
                        if (res == true) {
                            if (result.result[0].usu_status == 1) {
                                delete result.result[0].nip
                                resolve({
                                    valido: 1,
                                    mensaje: "Datos Correctos",
                                    token: '',
                                    /* token: service.createToken(datos),*/
                                    addenda: result.result[0]
                                });
                            } else {
                                resolve({
                                    valido: 0,
                                    mensaje: "Su cuenta esta desactivada"
                                });
                            }
                        } else {
                            resolve({
                                valido: 0,
                                mensaje: "Datos Incorrectos"
                            });
                        }
                    });
                } else {
                    resolve({
                        valido: 0,
                        mensaje: "No se encuentra registrado "
                    });
                }
            })
    })
}

function obtenerUsuarios() {
    return new Promise(function (resolve, reject) {
        UsuarioSistemaModel.obtenerUsuarios()
            .then(function (result) {
                if (result.err) {
                    resolve({
                        valido: 0,
                        mensaje: 'No se pudo obtener los usuarios'
                    });
                } else {
                    resolve({
                        valido: 1,
                        addenda: result.result
                    });
                }
            })
    })
}

function Add(datos) {
    return new Promise(function (resolve, reject) {
        UsuarioSistemaModel.getUsuarioByUserName({
                username: datos.username
            })
            .then(function (result) {
                if (result.result.length > 0) {
                    resolve(!result.err ? {
                        mensaje: "El correo ya estan en uso",
                        valido: 0
                    } : {
                        mensaje: " Error al buscar el usuario",
                        valido: 0
                    })
                } else {
                    var hashNew = bcrypt.hashSync(datos.nip, 10);

                    if (!hashNew) {
                        return res.status(200).send({
                            mensaje: 'Error no se pudo generar la contraseña (bcrypt)'
                        });
                    } else {
                        datos.nip = hashNew;
                        UsuarioSistemaModel.addUser(datos)
                            .then(function (result) {
                                if (result.err) {
                                    resolve({
                                        valido: 0,
                                        mensaje: 'Add error in database'
                                    });
                                } else {
                                    //let valor = result.result[0];
                                    resolve(!result.err ? {
                                        valido: 1,
                                        addenda: result.result[0],
                                        mensaje: "Se agrego Correctamente"
                                    } : reject({
                                        valido: 0,
                                        mensaje: 'Add error in database'
                                    }))
                                    /*
                                    UsuarioSistemaModel.GetUsuarioSistemaById({
                                            id_usuario_sistema: result.id
                                        })
                                        .then(function (result) {
                                            if (!result.err) {
                                                resolve(!result.err ? {
                                                    valido: 1,
                                                    addenda: result.result[0],
                                                    mensaje: "Se agrego Correctamente"
                                                } : reject({
                                                    valido: 0,
                                                    mensaje: 'Add error in database'
                                                }))
                                            }
                                        })
                                    */
                                }
                            })
                    }
                    /*
                    bcrypt.hash(datos.nip, null, null, function (err, hash) {
                        if (err) {
                            return res.status(200).send({
                                mensaje: 'Error no se pudo generar la contraseña (bcrypt)'
                            });
                        } else {
                            datos.nip = hash;
                            UsuarioSistemaModel.Add(datos)
                                .then(function (result) {
                                    if(result.err){
                                        resolve({
                                            valido: 0,
                                            mensaje: 'Add error in database'
                                        });
                                    } else {
                                        UsuarioSistemaModel.GetUsuarioSistemaById({id_usuario_sistema: result.id})
                                            .then(function (result) {
                                                if (!result.err) {
                                                    resolve(!result.err ? {
                                                        valido: 1,
                                                        addenda: result.result[0],
                                                        mensaje: "Se agrego Correctamente"
                                                    } : reject({
                                                        valido: 0,
                                                        mensaje: 'Add error in database'
                                                    }))
                                                }
                                            })
                                    }

                                })
                        }
                    }) */
                }
            })
    })
}

function Update(d) {
    return new Promise(function (resolve, reject) {
        UsuarioSistemaModel.GetUsuarioSistemaById(d)
            .then(function (result) {
                if (result) {
                    if (d.nip.length > 10) {
                        d.nip = result.result[0].nip;
                        UsuarioSistemaModel.Update(d)
                            .then(function (result) {
                                if (!result.err) {
                                    resolve({
                                        valido: 1,
                                        mensaje: "Se ha Actualizado Correctamente"
                                    });
                                } else {
                                    resolve({
                                        valido: 0,
                                        mensaje: "Error al Actualizar"
                                    })
                                }
                            })
                    } else {
                        var hashNew = bcrypt.hashSync(d.nip, 10);
                        d.nip = hashNew;
                        UsuarioSistemaModel.Update(d)
                        .then(function (result) {
                            if (!result.err) {
                                resolve({
                                    valido: 1,
                                    mensaje: "Se ha Actualizado Correctamente"
                                });
                            } else { 
                                resolve({
                                    valido: 0,
                                    mensaje: "Error al Actualizar"
                                })
                            }
                        })
                        /*
                        bcrypt.hash(d.nip, null, null, function (err, hash) {
                            if (err) {
                                return res.status(200).send({
                                    valido: 0,
                                    mensaje: 'Error no se pudo generar la contraseña (bcrypt)'
                                });
                            } else {
                                d.nip = hash;
                                UsuarioSistemaModel.Update(d)
                                    .then(function (result) {
                                        if (!result.err) {
                                            resolve({
                                                valido: 1,
                                                mensaje: "Se ha Actualizado Correctamente"
                                            });
                                        } else {
                                            resolve({
                                                valido: 0,
                                                mensaje: "Error al Actualizar"
                                            })
                                        }
                                    })
                            }
                        }) */
                    }
                } else {
                    resolve({
                        status: 0,
                        mensaje: "El Usuario no existe"
                    })
                }

            })

    })
}

function obtenerPerfilesConsola() {
    return new Promise(function (resolve, reject) {
        UsuarioSistemaModel.obtenerPerfilesConsola()
            .then(function (result) {
                if (result.err) {
                    resolve({
                        ok: false,
                        mensaje: 'No se pudo obtener los perfiles'
                    });
                } else {
                    resolve({
                        ok: true,
                        addenda: result.result[0]
                    });
                }
            })
    })
}