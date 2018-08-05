/**
 * Library to perform basic CRUD on data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify fs functions
const openFile = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);
const truncateFile = util.promisify(fs.truncate);
const writeFile = util.promisify(fs.writeFile);
const closeFile = util.promisify(fs.close);
const deleteFile = util.promisify(fs.unlink);

// Container for library
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Create and write data to a file
lib.create = (dir, file, data) => {
    // Convert passed in data to string
    let stringData = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        // Open new file for writing
        openFile(`${lib.baseDir}${dir}/${file}.json`, 'wx').then((fd) => {
            // Write to the file
            writeFile(fd, stringData).then(() => {
                // Close the newly created file
                closeFile(fd).then(() => console.log('Successfully created new file')).catch(err => reject(err));
            }).catch(err => reject(err, 'Error writing new file'));
        }).catch(err => reject(err));
    }).catch(err => console.log(err));
};

// Read From a file 
lib.read = (dir, file) => {
    return new Promise((resolve, reject) => {
        // Read from the file
        readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8').then((data) => {
            resolve(JSON.parse(data));
        }).catch(err => {
            reject(err);
        });
    }).catch(err => console.log(err));
};

// Update data in a file
lib.update = (dir, file, data) => {
    // Convert passed in data to string
    let filePath = `${lib.baseDir}${dir}/${file}.json`;
    let stringData = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        // Open the file fo update
        openFile(filePath, 'r+').then((fd) => {
            // Truncate the file
            truncateFile(filePath).then(() => {
                // Write to the file
                writeFile(fd, stringData).then(() => {
                    // Close the file
                    closeFile(fd).then(() => console.log('Successfully updated existing file')).catch(err => reject(err));
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    }).catch(err => console.log(err));
};

// // Delete a file
lib.delete = (dir, file) => {
    // Delete the file
    deleteFile(`${lib.baseDir}${dir}/${file}.json`)
        .then(() => console.log('File successfully deleted'))
        .catch(err => console.log(err));
};

// Export the module
module.exports = lib;