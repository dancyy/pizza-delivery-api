/**
 * Handle incoming request
 */

// Dependencies
const routeUsers = require('./routes/users');
const routeTokens = require('./routes/tokens');


// Define the acceptable methods
const acceptableMethods = ['post', 'get', 'put', 'delete'];

// Define the handlers
let handlers = {};

// Users handler
handlers.users = (data, callback) => {
    if(acceptableMethods.indexOf(data.method) > -1) {
        routeUsers[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Tokens handler
handlers.tokens = (data, callback) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
        routeTokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Not Found handler
handlers.notFound = (data, callback) => {
    callback(404, { 'Error': 'This page does not exist' });
};

// Export Handlers module
module.exports = handlers;