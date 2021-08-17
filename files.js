const express = require('express');
const files = express();

//permiso de carpetas de ser visualidades
files.use('/media', express.static(__dirname + '/media'));

module.exports = files;