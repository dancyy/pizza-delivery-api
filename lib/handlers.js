/**
 * Handle incoming request
 */

// Dependencies
const routeUsers = require('./routes/users');
const routeTokens = require('./routes/tokens');
const routeMenus = require('./routes/menus');
const routeCarts = require('./routes/carts');

// Define the handlers
let handlers = {};

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        routeUsers[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Tokens handler
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        routeTokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Menus handler
handlers.menus = (data, callback) => {
    const acceptableMethods = ['get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        routeMenus[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Carts handler
handlers.carts = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        routeCarts[data.method](data, callback);
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