'use strict';
const nodemailer = require('nodemailer');
const config = require('../config');
const fs = require('fs')
const path = require('path');

module.exports = {
  enviarMail: enviarMail,
  enviarMailPDF: enviarMailPDF
}


function enviarMail(to, body, subject) {
  return new Promise(function (resolve, reject) {
    var transporter = nodemailer.createTransport({
      host: 'smtp.1and1.mx',
      port: 25,
      secure: false,
      ignoreTLS: true,
      auth: {
        user: config.ADMIN_MAIL,
        pass: config.ADMIN_MAIL_PASS
      }
    });

    var message = {
      from: 'desarrollo@mob-tk.com',
      to: to,
      subject: subject,
      html: body
    };

    transporter.sendMail(message, function (err) {
      if (!err) {
        console.log('Email enviado ');
      } else
        console.log(err);
      resolve();
    });
  });
}

function enviarMailPDF(to, subject, html_correo, busqueda, nombre_archivo) {
  return new Promise(function (resolve, reject) {
    var transporter = nodemailer.createTransport({
      host: 'smtp.1and1.mx',
      port: 25,
      secure: false,
      ignoreTLS: true,
      auth: {
        user: config.ADMIN_MAIL,
        pass: config.ADMIN_MAIL_PASS
      }
    });
    // fs.readFile("./media/excel/pagosm2.pdf"

    var message = {
      from: 'desarrollo@mob-tk.com',
      to: to,
      subject: subject,
      attachments: [{ // file on disk as an attachment
        filename: nombre_archivo + '.pdf',
        path: path.join(__dirname, '..', 'media', 'pdf', nombre_archivo + '.pdf'),
      }],
      html: html_correo
    };


    transporter.sendMail(message, function (err) {
      if (!err) {
        resolve({
          valido: 1
        })
        transporter.close();
        console.log('Email enviado ' + to);
      } else
        console.log(err);
      resolve();
    });

  });
}