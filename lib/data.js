/**
 * Library to perform basic CRUD on data
 */

// Dependencies
const fs = require('fs');
const path = require('path');

// Container for library
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Create and write data to a file
lib.create = (dir, file, data, callback) => {
    // Convert passed in data to string
    let stringData = JSON.stringify(data);
    
    // Open new file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fd) => {
        if(!err && fd) {
            // Write to the file
            fs.writeFile(fd, stringData, (err) => {
                if(!err) {
                    // Close the file
                    fs.close(fd, (err) => {
                        if(!err) {
                            callback(false)
                        } else {
                            callback('Error closing the file');
                        }
                    });      
                } else {
                    callback('Error writing to file');
                }
            });
        } else {
            callback('Error opening file to write');
        }
    });
};

// Read From a file 
lib.read = (dir, file, callback) => {
    // Read from file
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
        !err && data ? callback(false, JSON.parse(data)) : callback(err, data); 
    });
};

// Update data in a file
lib.update = (dir, file, data, callback) => {
    // Convert passed in data to string
    filePath = `${lib.baseDir}${dir}/${file}.json`;
    let stringData = JSON.stringify(data);

    // Open the file to update
    fs.open(filePath, 'r+', (err, fd) => {
        if(!err && fd) {
            // Truncate the file
            fs.truncate(filePath, (err) => !err ?  
                fs.writeFile(fd, stringData, (err) => !err ? 
                    fs.close(fd, (err) => !err ? 
                        callback(false) : 
                    callback('Error closing file')) : 
                callback('Error writing to existing file')) :
            callback('Error truncating file'))
        } else {
            callback('Error opening file to update');
        }
    });     
};

// Rename a file
lib.rename = (dir, oldFile, newFile, callback) => {
    fs.rename(`${lib.baseDir}${dir}/${oldFile}.json`, `${lib.baseDir}${dir}/${newFile}.json`, (err) => {
        if(err) throw err;
        callback('Rename complete!');
    });

};

// Delete a file
lib.delete = (dir, file, callback) => {
    // Delete the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`,(err) => {
        if(!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

// Export the module
module.exports = lib;