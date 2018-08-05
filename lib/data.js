/**
 * Library to perform basic CRUD on data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify fs functions
const openFile = util.promisify(fs.open);
const writeFile = util.promisify(fs.writeFile);
const closeFile = util.promisify(fs.close);

// Container for library
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Create and write data to a file
lib.create = (dir, file, data) => {
    // Open new file for writing
    openFile(`${lib.baseDir}${dir}/${file}.json`, 'wx').then((fd) => {
        // Convert passed in data to string
        let stringData = JSON.stringify(data);
        // Write to the file
        writeFile(fd, stringData).then(() => {
            // Close the newly created file
            closeFile(fd).then(() => console.log('Successfully created new file')).catch(err => {console.log(err)});
        }).catch(err => console.log(err, 'Error writing new file'));
    }).catch(err => console.log(err, 'Error opening new file to write'));
};



// Export the module
module.exports = lib;