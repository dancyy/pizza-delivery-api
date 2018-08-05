// Define the handlers
let handlers = {};

// hello handler
handlers.users = (data, callback) => {
    callback(200, { 'message': 'Hello World' })
};

// Not Found handler
handlers.notFound = (data, callback) => {
    callback(404, { 'Error': 'This page does not exist' });
};

// Export Handlers module
module.exports = handlers;