// const Promise = require('promise');
// const execFile = require('child_process').execFile;
// const fs = require('fs');
const generator = require('./generator.js');
const uploader = require('./uploader.js');

module.exports = 
{
	generate: generator.main
	, upload: uploader.main
};
