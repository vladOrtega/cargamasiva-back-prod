'use strict'
const SettingModel = require('../models/setting.model');
const texts = require("../texts");
var QRCode = require('qrcode');
const path = require('path');

module.exports = {
  getSettings: getSettings
}

function getSettings() {
  return new Promise(function (resolve, reject) {
    SettingModel.getSettings()
      .then(function (result) {
        if (!result.err) {
          resolve({
            settings: result.result,
            valido: 1,
            mensaje: texts.OK_RES
          })
        } else {
          resolve({
            valido: 0,
            mensaje: "Sin datos disponibles"
          })
        }
      })
  })
}